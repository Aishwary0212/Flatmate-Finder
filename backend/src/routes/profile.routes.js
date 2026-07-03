import express from "express";
import {
  createOrUpdateProfile,
  getMyProfile,
} from "../controllers/profile.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getMyProfile).put(createOrUpdateProfile);

export default router;
