import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    location: { type: String, required: true },
    rent: { type: Number, required: true },
    availableFrom: { type: Date, required: true },
    roomType: { type: String, required: true },
    furnishingStatus: { type: String, required: true },
    photos: [{ type: String }],
    isFilled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Listing", listingSchema);
