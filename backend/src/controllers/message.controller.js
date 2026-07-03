import Message from "../models/Message.js";
import Interest from "../models/Interest.js";
import Listing from "../models/Listing.js";
import TenantProfile from "../models/TenantProfile.js";


export const getMessages = async (req, res) => {
  try {
    const { interestId } = req.params;

    const interest = await Interest.findById(interestId).populate("tenantId");
    if (!interest)
      return res.status(404).json({ error: "Conversation not found" });

    const listing = await Listing.findById(interest.listingId);
    const isTenant =
      interest.tenantId.userId.toString() === req.user._id.toString();
    const isOwner = listing.ownerId.toString() === req.user._id.toString();

    if (!isTenant && !isOwner && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Not authorized to view this conversation" });
    }

    if (interest.status !== "ACCEPTED") {
      return res
        .status(403)
        .json({ error: "Chat is only available after interest is accepted" });
    }

    const messages = await Message.find({ interestId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name role");

    res.json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ error: "Failed to load messages" });
  }
};
