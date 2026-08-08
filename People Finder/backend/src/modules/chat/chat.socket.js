import Chat from "./chat.model.js";
import Message from "./message.model.js";
import User from "../auth/user.model.js";
import { createUserNotification } from "../notifications/notification.service.js";
import { sessionMiddleware } from "../../config/session.js";

const userSocketCounts = new Map();

export function setupSocketIO(io) {
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.use((socket, next) => {
    const userId =
      socket.request.session?.userId ||
      socket.handshake.auth?.userId ||
      socket.handshake.query?.userId;
    if (!userId) {
      return next(new Error("No autenticado"));
    }
    socket.userId = userId.toString();
    return next();
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    const activeSockets = (userSocketCounts.get(socket.userId) || 0) + 1;
    userSocketCounts.set(socket.userId, activeSockets);

    User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeenAt: new Date(),
    }).catch(() => {});

    io.emit("user_presence_update", {
      userId: socket.userId,
      isOnline: true,
      lastSeenAt: new Date().toISOString(),
    });

    socket.on("join_chat", async ({ chatId }) => {
      const chat = await Chat.findOne({ _id: chatId, participants: socket.userId });
      if (chat) {
        socket.join(`chat:${chatId}`);
      }
    });

    socket.on(
      "send_message",
      async ({ chatId, text = "", imageUrl = "", clientMessageId = "" }) => {
        try {
          const chat = await Chat.findOne({
            _id: chatId,
            participants: socket.userId,
          });
          if (!chat) {
            socket.emit("chat_error", { message: "Chat no encontrado" });
            return;
          }

          const cleanText = (text || "").trim();
          const cleanImage = (imageUrl || "").trim();
          if (!cleanText && !cleanImage) {
            socket.emit("chat_error", { message: "Mensaje vacio" });
            return;
          }

          const message = await Message.create({
            chat: chat._id,
            sender: socket.userId,
            type: cleanImage ? "image" : "text",
            text: cleanText,
            imageUrl: cleanImage,
            readBy: [socket.userId],
          });

          chat.lastMessage = cleanImage ? "[Imagen]" : cleanText;
          chat.lastMessageAt = new Date();
          await chat.save();

          const populatedMessage = await message.populate(
            "sender",
            "username fullName profileImage"
          );

          socket.emit("new_message", {
            chatId: chat._id,
            message: populatedMessage,
            clientMessageId: clientMessageId || undefined,
          });

          socket.to(`chat:${chat._id.toString()}`).emit("new_message", {
            chatId: chat._id,
            message: populatedMessage,
          });

          chat.participants.forEach((participantId) => {
            io.to(`user:${participantId.toString()}`).emit("chat_updated", {
              chatId: chat._id,
              lastMessage: chat.lastMessage,
              lastMessageAt: chat.lastMessageAt,
            });
          });

          const senderName =
            populatedMessage?.sender?.fullName ||
            populatedMessage?.sender?.username ||
            "Nuevo mensaje";
          const recipients = chat.participants
            .map((id) => id.toString())
            .filter((id) => id !== socket.userId);

          for (const recipientId of recipients) {
            await createUserNotification({
              recipientId,
              actorId: socket.userId,
              type: "message",
              title: "Nuevo mensaje",
              body: `${senderName}: ${cleanImage ? "[Imagen]" : cleanText}`,
              data: { chatId: chat._id.toString() },
              io,
            });
          }
        } catch (error) {
          socket.emit("chat_error", { message: "No fue posible enviar mensaje" });
        }
      }
    );

    socket.on("mark_chat_read", async ({ chatId }) => {
      try {
        const chat = await Chat.findOne({
          _id: chatId,
          participants: socket.userId,
        });
        if (!chat) {
          return;
        }

        const unreadMessages = await Message.find({
          chat: chat._id,
          sender: { $ne: socket.userId },
          readBy: { $ne: socket.userId },
        }).select("_id");

        if (!unreadMessages.length) {
          return;
        }

        const messageIds = unreadMessages.map((msg) => msg._id.toString());

        await Message.updateMany(
          { _id: { $in: unreadMessages.map((msg) => msg._id) } },
          { $addToSet: { readBy: socket.userId } }
        );

        const payload = {
          chatId: chat._id.toString(),
          readerId: socket.userId.toString(),
          messageIds,
        };

        io.to(`chat:${chat._id.toString()}`).emit("chat_read", payload);
        chat.participants.forEach((participantId) => {
          io.to(`user:${participantId.toString()}`).emit("chat_read", payload);
        });
      } catch (_error) {
        // Ignorado: no interrumpimos la sesión de socket por errores de lectura.
      }
    });

    socket.on("disconnect", () => {
      const remaining = Math.max(
        (userSocketCounts.get(socket.userId) || 1) - 1,
        0
      );

      if (remaining <= 0) {
        userSocketCounts.delete(socket.userId);
        const lastSeenAt = new Date();

        User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeenAt,
        }).catch(() => {});

        io.emit("user_presence_update", {
          userId: socket.userId,
          isOnline: false,
          lastSeenAt: lastSeenAt.toISOString(),
        });
        return;
      }

      userSocketCounts.set(socket.userId, remaining);
    });
  });
}
