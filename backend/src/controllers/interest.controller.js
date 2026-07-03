import { z } from "zod";
import CompatibilityScore from "../models/CompatibilityScore.js";
import Interest from "../models/Interest.js";
import Listing from "../models/Listing.js";
import TenantProfile from "../models/TenantProfile.js";
import User from "../models/User.js";
import {
  notifyOwnerOfHighInterest,
  notifyTenantOfDecision,
} from "../services/email.service.js";

const sendInterestSchema = z.object({
  listingId: z.string().length(24, "Invalid listing ID"),
});

export const sendInterest = async (req, res) => {
  try {
    const { listingId } = sendInterestSchema.parse(req.body);

    
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.isFilled)
      return res
        .status(400)
        .json({ error: "This listing is no longer available" });

    
    if (listing.ownerId.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "Cannot send interest to your own listing" });
    }

    
    const profile = await TenantProfile.findOne({ userId: req.user._id });
    if (!profile)
      return res
        .status(400)
        .json({ error: "Please complete your profile first" });

    
    const existing = await Interest.findOne({
      tenantId: profile._id,
      listingId: listing._id,
    });
    if (existing)
      return res
        .status(400)
        .json({ error: "Interest already sent for this listing" });

    
    const interest = await Interest.create({
      tenantId: profile._id,
      listingId: listing._id,
    });

    
    const scoreDoc = await CompatibilityScore.findOne({
      tenantId: profile._id,
      listingId: listing._id,
    });

    if (scoreDoc && scoreDoc.score > 80) {
      const owner = await User.findById(listing.ownerId);
      if (owner) {
        
        notifyOwnerOfHighInterest(
          owner.email,
          req.user.name,
          listing.title,
          scoreDoc.score,
        );
      }
    }

    res.status(201).json(interest);
  } catch (error) {
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: error.errors.map((e) => e.message).join(", ") });
    }
    console.error("Send Interest Error:", error);
    res.status(500).json({ error: "Failed to send interest" });
  }
};


export const respondToInterest = async (req, res) => {
  try {
    const { status } = z
      .object({
        status: z.enum(["ACCEPTED", "DECLINED"]),
      })
      .parse(req.body);

    const interest = await Interest.findById(req.params.id).populate(
      "tenantId",
    );
    if (!interest) return res.status(404).json({ error: "Interest not found" });

    
    const listing = await Listing.findById(interest.listingId);
    if (!listing || listing.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to respond to this interest" });
    }

    
    interest.status = status;
    await interest.save();

    const tenantUser = await User.findById(interest.tenantId.userId);
    if (tenantUser) {
      notifyTenantOfDecision(
        tenantUser.email,
        req.user.name,
        listing.title,
        status,
      );
    }

    res.json(interest);
  } catch (error) {
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: error.errors.map((e) => e.message).join(", ") });
    }
    console.error("Respond Interest Error:", error);
    res.status(500).json({ error: "Failed to update interest" });
  }
};


export const getMySentInterests = async (req, res) => {
  try {
    const profile = await TenantProfile.findOne({ userId: req.user._id });
    if (!profile) return res.json([]);

    const interests = await Interest.find({ tenantId: profile._id })
      .populate("listingId")
      .sort({ createdAt: -1 });

    res.json(interests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sent interests" });
  }
};


export const getMyReceivedInterests = async (req, res) => {
  try {
    const myListingIds = await Listing.find({ ownerId: req.user._id }).distinct(
      "_id",
    );

    const interests = await Interest.find({ listingId: { $in: myListingIds } })
      .populate({
        path: "tenantId",
        populate: { path: "userId", select: "name email" },
      })
      .populate("listingId", "title location rent")
      .sort({ createdAt: -1 });

    res.json(interests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch received interests" });
  }
};

export const removeInterest = async (req, res) => {
  try {
    const interest = await Interest.findById(req.params.id);
    if (!interest) return res.status(404).json({ error: "Interest not found" });

  
    const profile = await TenantProfile.findOne({ userId: req.user._id });
    if (!profile || interest.tenantId.toString() !== profile._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to remove this interest" });
    }

    await Interest.findByIdAndDelete(req.params.id);
    res.json({ message: "Interest removed successfully" });
  } catch (error) {
    console.error("Remove Interest Error:", error);
    res.status(500).json({ error: "Failed to remove interest" });
  }
};
