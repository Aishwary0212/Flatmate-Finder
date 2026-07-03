import mongoose from "mongoose";

const compatibilityScoreSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TenantProfile",
    required: true,
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  score: { type: Number, required: true, min: 0, max: 100 },
  explanation: { type: String, required: true },
  computedAt: { type: Date, default: Date.now },
});

compatibilityScoreSchema.index({ tenantId: 1, listingId: 1 }, { unique: true });

export default mongoose.model("CompatibilityScore", compatibilityScoreSchema);
