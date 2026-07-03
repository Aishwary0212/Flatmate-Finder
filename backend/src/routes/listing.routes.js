import express from "express";
import {
  browseListings,
  createListing,
  deleteListing,
  getListingById,
  getMyListings,
  markAsFilled,
  markAsUnfilled,
  updateListing,
} from "../controllers/listing.controller.js";
import {
  authorize,
  optionalProtect,
  protect,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/browse", optionalProtect, browseListings);
router.get("/my-listings", protect, authorize("OWNER", "ADMIN"), getMyListings);
router.get("/:id", getListingById);


router.use(protect);

router.post("/", authorize("OWNER", "ADMIN"), createListing);
router.put("/:id", authorize("OWNER", "ADMIN"), updateListing);
router.patch("/:id/fill", authorize("OWNER", "ADMIN"), markAsFilled);
router.patch("/:id/unfill", authorize("OWNER", "ADMIN"), markAsUnfilled);
router.delete("/:id", authorize("OWNER", "ADMIN"), deleteListing);

export default router;
