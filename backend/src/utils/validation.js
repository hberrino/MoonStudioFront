const NAME_REGEX = /^[\p{L}\s'-]{2,80}$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\d{7,12}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;
const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
]);

export function sanitizeText(value, maxLength = 255) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function normalizeEmail(value) {
  return sanitizeText(value, 254).toLowerCase();
}

export function normalizePhone(value) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 12);
}

export function isValidClientName(value) {
  return NAME_REGEX.test(sanitizeText(value, 80));
}

export function isValidEmail(value) {
  const email = normalizeEmail(value);
  const domain = email.split("@")[1];
  return EMAIL_REGEX.test(email) && ALLOWED_EMAIL_DOMAINS.has(domain);
}

export function isValidPhone(value) {
  return PHONE_REGEX.test(normalizePhone(value));
}

export function isValidPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

export function isValidDate(value) {
  if (!DATE_REGEX.test(String(value))) return false;

  const date = new Date(`${value}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(date.getTime()) && date >= today;
}

export function isValidTime(value) {
  if (!TIME_REGEX.test(String(value))) return false;
  const [hours, minutes] = String(value).split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function normalizeNullablePrice(value) {
  if (value === null || value === undefined || value === "") return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 && price <= 99999999.99 ? price : null;
}

export function normalizePriceType(value) {
  const priceType = String(value ?? "consultar").trim().toLowerCase();
  return ["consultar", "fijo", "desde", "rango"].includes(priceType) ? priceType : null;
}
