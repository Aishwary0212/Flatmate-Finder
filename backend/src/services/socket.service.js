import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Interest from "../models/Interest.js";
import Listing from "../models/Listing.js";
import Message from "../models/Message.js";

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
};

const verifyRoomAccess = async (userId, interestId) => {
  const interest = await Interest.findById(interestId).populate("tenantId");
  if (!interest || interest.status !== "ACCEPTED") return false;

  const listing = await Listing.findById(interest.listingId);
  if (!listing) return false;

  const isTenant = interest.tenantId.userId.toString() === userId.toString();
  const isOwner = listing.ownerId.toString() === userId.toString();

  return isTenant || isOwner;
};

export const initializeSocket = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Join a conversation room
    socket.on("join_room", async (interestId) => {
      try {
        const hasAccess = await verifyRoomAccess(socket.user._id, interestId);
        if (!hasAccess) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        socket.join(interestId);
        socket.emit("room_joined", { interestId });
      } catch (error) {
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Send a message
    socket.on("send_message", async ({ interestId, content }) => {
      try {
        // Re-verify access on every message for security
        const hasAccess = await verifyRoomAccess(socket.user._id, interestId);
        if (!hasAccess) {
          socket.emit("error", { message: "Access denied" });
          return;
        }

        if (!content || !content.trim()) return;

        // Persist to DB first
        const message = await Message.create({
          interestId,
          senderId: socket.user._id,
          content: content.trim(),
        });

        const populatedMessage = await Message.findById(message._id).populate(
          "senderId",
          "name role",
        );

        // Broadcast to everyone in the room
        io.to(interestId).emit("new_message", populatedMessage);
      } catch (error) {
        console.error("Socket Send Error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.user?.name}`);
    });
  });
};
