import { Resend } from "resend";
import { config } from "../config/env.js";

function getResendClient() {
  const apiKey = config.resendApiKey;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no configurado en el servidor");
  }
  return new Resend(apiKey);
}

export async function sendEmailVerification({ to, fullName, token }) {
  const resend = getResendClient();
  const verificationUrl = `${config.appBaseUrl}/auth/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: config.resendFrom,
    to: [to],
    subject: "Verifica tu correo en PeopleFinder",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.4; color: #111;">
        <h2>Hola ${fullName || "usuario"}</h2>
        <p>Gracias por registrarte en PeopleFinder.</p>
        <p>Para activar tu cuenta y obtener el estado de perfil verificado, confirma tu correo aquí:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Este enlace expira en 24 horas.</p>
      </div>
    `,
    text: `Hola ${fullName || "usuario"}. Verifica tu correo en PeopleFinder: ${verificationUrl} (expira en 24 horas).`,
  });

  if (error) {
    console.error("Error al enviar email de verificación con Resend:", error);
    throw new Error(error.message || "Error al enviar email con Resend");
  }

  return verificationUrl;
}

export async function sendPasswordResetEmail({ to, fullName, token }) {
  const resend = getResendClient();
  const resetUrl = `${config.appBaseUrl}/auth/reset-password/verify?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: config.resendFrom,
    to: [to],
    subject: "Recupera tu contraseña en PeopleFinder",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.45; color: #111;">
        <h2>Hola ${fullName || "usuario"}</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Tu token de recuperación es:</p>
        <p style="font-size:18px; font-weight:700; letter-spacing:1px;">${token}</p>
        <p>También puedes abrir este enlace:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>El token expira en 60 minutos.</p>
      </div>
    `,
    text: `Hola ${fullName || "usuario"}. Tu token de recuperación es: ${token}. También puedes abrir ${resetUrl}. El token expira en 60 minutos.`,
  });

  if (error) {
    console.error("Error al enviar email de recuperación con Resend:", error);
    throw new Error(error.message || "Error al enviar email con Resend");
  }

  return resetUrl;
}
