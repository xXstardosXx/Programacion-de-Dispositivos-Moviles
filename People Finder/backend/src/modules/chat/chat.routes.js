import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  listChats,
  getChat,
  createChat,
  sendMessage,
  deleteChat,
  listChatMessages,
  markChatAsRead,
  getUnreadSummary,
} from "./chat.controller.js";
import { uploadChatImage } from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", listChats);
router.get("/unread-summary", getUnreadSummary);
router.get("/:id", getChat);
router.get("/:id/messages", listChatMessages);
router.post("/", createChat);
router.post("/:id/messages", uploadChatImage.single("image"), sendMessage);
router.post("/:id/read", markChatAsRead);
router.delete("/:id", deleteChat);

export default router;
