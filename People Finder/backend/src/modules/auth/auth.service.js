import crypto from "crypto";
import { sendEmailVerification, sendPasswordResetEmail } from "../../utils/mailer.util.js";

export function parseInterests(rawInterests) {
  if (Array.isArray(rawInterests)) {
    return rawInterests
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof rawInterests === "string") {
    const trimmed = rawInterests.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
      }
    } catch (_error) {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export const DEFAULT_PRIVACY_SETTINGS = {
  profileVisibility: "public",
  friendRequestPermission: "everyone",
  messagePermission: "friends",
  appearanceMode: "dark",
  showCity: true,
  showOnlineStatus: true,
  showReadReceipts: true,
  showLastSeen: true,
};

export function normalizePrivacySettings(raw = {}) {
  const profileVisibilityOptions = ["public", "friends", "private"];
  const friendRequestOptions = ["everyone", "friends_of_friends", "nobody"];
  const messageOptions = ["everyone", "friends"];
  const appearanceOptions = ["dark", "light"];

  const settings = {
    ...DEFAULT_PRIVACY_SETTINGS,
    ...(raw || {}),
  };

  if (!profileVisibilityOptions.includes(settings.profileVisibility)) {
    settings.profileVisibility = DEFAULT_PRIVACY_SETTINGS.profileVisibility;
  }
  if (!friendRequestOptions.includes(settings.friendRequestPermission)) {
    settings.friendRequestPermission =
      DEFAULT_PRIVACY_SETTINGS.friendRequestPermission;
  }
  if (!messageOptions.includes(settings.messagePermission)) {
    settings.messagePermission = DEFAULT_PRIVACY_SETTINGS.messagePermission;
  }
  if (!appearanceOptions.includes(settings.appearanceMode)) {
    settings.appearanceMode = DEFAULT_PRIVACY_SETTINGS.appearanceMode;
  }

  settings.showCity = Boolean(settings.showCity);
  settings.showOnlineStatus = Boolean(settings.showOnlineStatus);
  settings.showReadReceipts = Boolean(settings.showReadReceipts);
  settings.showLastSeen = Boolean(settings.showLastSeen);

  return settings;
}

export function buildEmailVerificationPayload() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return {
    token,
    tokenHash,
    expires,
  };
}

export function buildPasswordResetPayload() {
  const token = crypto.randomBytes(3).toString("hex").toUpperCase();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  return {
    token,
    tokenHash,
    expires,
  };
}

export async function dispatchVerificationEmail(user, token) {
  try {
    await sendEmailVerification({
      to: user.email,
      fullName: user.fullName,
      token,
    });
    return { sent: true };
  } catch (error) {
    console.error("No fue posible enviar el email de verificación:", error.message);
    return { sent: false, error: error.message };
  }
}
