import { Resend } from "resend";
import { env } from "../config/env.js";

let resendClient = null;

function getResendClient() {
  if (!env.email.resendApiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(env.email.resendApiKey);
  }
  return resendClient;
}

function formatTurnoDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}

function formatTurnoTime(value) {
  return String(value || "").slice(0, 5);
}

export async function sendTurnoNotificationEmail({ profesional, turno }) {
  const resend = getResendClient();
  const to = profesional?.email;

  if (!resend || !to) {
    return { skipped: true };
  }

  const fecha = formatTurnoDate(turno.fecha);
  const hora = formatTurnoTime(turno.hora);
  const subject = `Nuevo turno solicitado - ${fecha} ${hora}`;
  const text = [
    `Hola ${profesional.nombre},`,
    "",
    "Se solicito un nuevo turno desde la web de Moon Studio.",
    "",
    `Cliente: ${turno.nombre_cliente}`,
    `Email: ${turno.email_cliente}`,
    `Telefono: ${turno.telefono_cliente}`,
    `Servicio: ${turno.servicio_nombre}`,
    `Fecha: ${fecha}`,
    `Hora: ${hora}`,
    "",
    "Recorda comunicarte con la clienta si necesitás confirmar detalles del servicio.",
  ].join("\n");

  return resend.emails.send({
    from: env.email.from,
    to,
    subject,
    text,
  });
}
