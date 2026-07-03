import express from "express";
import {
  getMyReceivedInterests,
  getMySentInterests,
  removeInterest,
  respondToInterest,
  sendInterest,
} from "../controllers/interest.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = express.Router();


router.use(protect);

router.post("/", authorize("TENANT"), sendInterest);
router.get("/sent", authorize("TENANT"), getMySentInterests);
router.get("/received", authorize("OWNER", "ADMIN"), getMyReceivedInterests);
router.patch("/:id/respond", authorize("OWNER", "ADMIN"), respondToInterest);
router.delete("/:id", authorize("TENANT"), removeInterest);

export default router;
