import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { sessionMiddleware } from "./config/session.js";
import authRoutes from "./modules/auth/auth.routes.js";
import friendRoutes from "./modules/friends/friend.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import { streamGridFSFile } from "./storage/gridfs.service.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(sessionMiddleware);

// Middleware de logging
app.use((req, _res, next) => {
  console.log(
    `${req.method} ${req.url} - Session: ${
      req.sessionID
    } - ${new Date().toISOString()}`
  );
  next();
});

// Ruta raíz
app.get("/", (_req, res) => {
  if (config.frontendUrl) {
    return res.redirect(config.frontendUrl);
  }

  return res.status(200).json({
    status: "ok",
    message: "PeopleFinder backend activo.",
  });
});

// Media streaming endpoint
app.get("/media/:fileId", async (req, res) => {
  try {
    const found = await streamGridFSFile(req.params.fileId, res);
    if (!found) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }
  } catch (error) {
    return res.status(500).json({ error: "No fue posible obtener el archivo" });
  }
});

// Montar módulos de la aplicación
app.use("/auth", authRoutes);
app.use("/friends", friendRoutes);
app.use("/chats", chatRoutes);
app.use("/notifications", notificationRoutes);

// Manejador global de errores
app.use(errorHandler);

export default app;
