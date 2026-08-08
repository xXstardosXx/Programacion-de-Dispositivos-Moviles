import session from "express-session";
import MongoStore from "connect-mongo";
import { config } from "./env.js";

export const sessionMiddleware = session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongoUri,
    collectionName: "sessions",
    ttl: 60 * 60,
    autoRemove: "native",
  }),
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
  },
});
