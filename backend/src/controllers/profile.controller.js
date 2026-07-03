import { z } from "zod";
import CompatibilityScore from "../models/CompatibilityScore.js";
import TenantProfile from "../models/TenantProfile.js";

const profileSchema = z
  .object({
    preferredLocation: z.string().min(2, "Location is required").trim(),
    minBudget: z.number().min(0, "Min budget cannot be negative"),
    maxBudget: z.number().positive("Max budget must be positive"),
    moveInDate: z.string().datetime({ message: "Invalid ISO date format" }),
  })
  .refine((data) => data.maxBudget >= data.minBudget, {
    message: "Max budget must be greater than or equal to min budget",
  });

export const createOrUpdateProfile = async (req, res) => {
  try {
    const validated = profileSchema.parse(req.body);

    const profile = await TenantProfile.findOneAndUpdate(
      { userId: req.user._id },
      { ...validated, userId: req.user._id },
      { new: true, upsert: true, runValidators: true },
    );

    await CompatibilityScore.deleteMany({ tenantId: profile._id });

    res.status(200).json(profile);
  } catch (error) {
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ error: error.errors.map((e) => e.message).join(", ") });
    }
    console.error("Profile Save Error:", error);
    res.status(500).json({ error: "Failed to save profile" });
  }
};

export const getMyProfile = async (req, res) => {
  const profile = await TenantProfile.findOne({ userId: req.user._id });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json(profile);
};
