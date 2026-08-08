import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { config } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { initGridFS } from "./storage/gridfs.service.js";
import { setupSocketIO } from "./modules/chat/chat.socket.js";

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

app.set("io", io);

setupSocketIO(io);

async function startServer() {
  await connectDatabase();
  initGridFS();

  httpServer.listen(config.port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${config.port}`);
    console.log("Sesiones almacenadas dinámicamente en MongoDB Atlas");
    console.log("Socket.IO activo para chat en vivo y presencia");
  });
}

startServer().catch((error) => {
  console.error("Error crítico al iniciar el servidor:", error);
  process.exit(1);
});
