export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string): string {
  return onlyDigits(value);
}
