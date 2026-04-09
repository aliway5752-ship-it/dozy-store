const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;

export const sanitizeText = (value: unknown, maxLength = 255): string => {
  if (typeof value !== "string") return "";
  return value
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
};

export const sanitizePhone = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.replace(/[^\d+]/g, "").slice(0, 20);
};

export const sanitizeEmail = (value: unknown): string => {
  const email = sanitizeText(value, 254).toLowerCase();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return isValid ? email : "";
};

export const toPositiveInt = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const intValue = Math.floor(parsed);
  return intValue < 0 ? fallback : intValue;
};

export const toSafePrice = (value: unknown): string | null => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed.toFixed(2);
};
