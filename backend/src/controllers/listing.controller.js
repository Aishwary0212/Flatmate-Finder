import { z } from "zod";
import Listing from "../models/Listing.js";
import TenantProfile from "../models/TenantProfile.js";
import { getCompatibilityScore } from "../services/compatibility.service.js";

const listingSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100)
    .trim(),
  location: z.string().min(2, "Location is required").trim(),
  rent: z.number().positive("Rent must be a positive number"),
  availableFrom: z
    .string()
    .datetime({ message: "Invalid ISO date format for availableFrom" }),
  roomType: z.enum(["Private Room", "Shared Room", "Entire Apartment"], {
    errorMap: () => ({ message: "Invalid room type" }),
  }),
  furnishingStatus: z.enum(["Furnished", "Semi-Furnished", "Unfurnished"], {
    errorMap: () => ({ message: "Invalid furnishing status" }),
  }),
  photos: z
    .array(z.string().url("Each photo must be a valid URL"))
    .min(1, "At least one photo is required"),
});


export const createListing = async (req, res) => {
  try {
    const validated = listingSchema.parse(req.body);

    const listing = await Listing.create({
      ...validated,
      ownerId: req.user._id,
    });

    res.status(201).json(listing);
  } catch (error) {
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: error.errors.map((e) => e.message).join(", ") });
    }
    console.error("Create Listing Error:", error);
    res.status(500).json({ error: "Failed to create listing" });
  }
};


export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ ownerId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(listings);
  } catch (error) {
    console.error("Get My Listings Error:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};


export const browseListings = async (req, res) => {
  try {
    const { location, minRent, maxRent, page = 1, limit = 10 } = req.query;

    const filter = { isFilled: false };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = Number(minRent);
      if (maxRent) filter.rent.$lte = Number(maxRent);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Listing.countDocuments(filter),
    ]);

    let enrichedListings = listings.map((l) => l.toObject());

    const isAuthenticated = !!req.user;
    const isTenant = req.user?.role === "TENANT";

    if (isAuthenticated && isTenant) {
      const profile = await TenantProfile.findOne({ userId: req.user._id });

      if (profile) {
        enrichedListings = await Promise.all(
          listings.map(async (listing) => {
            const compat = await getCompatibilityScore(
              profile._id,
              listing._id,
              profile,
              listing,
            );
            return {
              ...listing.toObject(),
              compatibilityScore: compat.score,
              compatibilityExplanation: compat.explanation,
            };
          }),
        );

        enrichedListings.sort(
          (a, b) => b.compatibilityScore - a.compatibilityScore,
        );
      }
    }

    res.json({
      listings: enrichedListings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("Browse Listings Error:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
};


export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Only owner or admin can update
    if (
      listing.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this listing" });
    }
    const validated = listingSchema.partial().parse(req.body);
    Object.assign(listing, validated);
    await listing.save();

    res.json(listing);
  } catch (error) {
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: error.errors.map((e) => e.message).join(", ") });
    }
    console.error("Update Listing Error:", error);
    res.status(500).json({ error: "Failed to update listing" });
  }
};

export const markAsFilled = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (
      listing.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    listing.isFilled = true;
    await listing.save();

    res.json({ message: "Listing marked as filled successfully", listing });
  } catch (error) {
    console.error("Mark Filled Error:", error);
    res.status(500).json({ error: "Failed to update listing status" });
  }
};

export const markAsUnfilled = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (
      listing.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    listing.isFilled = false;
    await listing.save();

    res.json({ message: "Listing marked as unfilled successfully", listing });
  } catch (error) {
    console.error("Mark Unfilled Error:", error);
    res.status(500).json({ error: "Failed to update listing status" });
  }
};


export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (
      listing.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this listing" });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Delete Listing Error:", error);
    res.status(500).json({ error: "Failed to delete listing" });
  }
};
