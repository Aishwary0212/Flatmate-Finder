import mongoose from "mongoose";

const tenantProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    preferredLocation: { type: String, required: true },
    minBudget: { type: Number, required: true },
    maxBudget: { type: Number, required: true },
    moveInDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("TenantProfile", tenantProfileSchema);
