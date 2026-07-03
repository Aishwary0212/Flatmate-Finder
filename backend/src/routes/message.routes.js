import express from "express";
import { getMessages } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.get("/:interestId", getMessages);

export default router;
