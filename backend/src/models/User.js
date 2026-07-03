import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // ✅ Added
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["TENANT", "OWNER", "ADMIN"],
      default: "TENANT",
    },
    profilePicture: { type: String, default: null }, // Profile picture URL
    bio: { type: String, default: "", trim: true }, // User bio
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
