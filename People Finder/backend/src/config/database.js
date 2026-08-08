import mongoose from "mongoose";
import { config } from "./env.js";

// Importar todos los modelos para registrar esquemas e índices en MongoDB Atlas
import User from "../modules/auth/user.model.js";
import FriendRequest from "../modules/friends/friendRequest.model.js";
import Chat from "../modules/chat/chat.model.js";
import Message from "../modules/chat/message.model.js";
import Notification from "../modules/notifications/notification.model.js";

export async function connectDatabase() {
  if (!config.mongoUri) {
    console.error("Error: MONGODB_URI no está definido");
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri);
    console.log("Conectado a MongoDB Atlas exitosamente");

    // Crear colecciones e índices en MongoDB Atlas de manera explícita
    await Promise.all([
      User.init(),
      FriendRequest.init(),
      Chat.init(),
      Message.init(),
      Notification.init(),
    ]);

    console.log("Colecciones e índices inicializados correctamente en MongoDB Atlas");
  } catch (error) {
    console.error("Error de conexión o inicialización en MongoDB:", error.message);
    process.exit(1);
  }
}
