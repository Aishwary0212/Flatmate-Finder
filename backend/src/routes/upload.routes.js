import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.middleware.js";
import cloudinary from "../services/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", protect, upload.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const uploadPromises = req.files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          uploadStream.end(file.buffer);
        }),
    );

    const results = await Promise.all(uploadPromises);
    const urls = results.map((result) => result.secure_url);
    res.json({ urls });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
});

export default router;
