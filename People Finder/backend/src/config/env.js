import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  sessionSecret: process.env.SESSION_SECRET || "dev-secret",
  frontendUrl: process.env.FRONTEND_URL || "",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:5000",
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  },
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFrom: process.env.RESEND_FROM || "PeopleFinder <onboarding@resend.dev>",
  resetPasswordDebugToken:
    String(process.env.RESET_PASSWORD_DEBUG_TOKEN || "").toLowerCase() === "true",
};
