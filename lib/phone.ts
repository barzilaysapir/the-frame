/**
 * Normalizes a locally-formatted Israeli phone number (e.g. "050-1234567")
 * into E.164 format (e.g. "+972501234567") for Firebase phone auth.
 * Returns null if the input doesn't look like a valid Israeli mobile/landline number.
 */
export function toIsraeliE164(rawInput: string): string | null {
  const digits = rawInput.replace(/\D/g, "");

  if (digits.startsWith("972") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `+972${digits.slice(1)}`;
  }
  if (digits.length === 9 && !digits.startsWith("0")) {
    return `+972${digits}`;
  }
  return null;
}

/**
 * Israeli mobile in national form (`05xxxxxxxx`) for Bit / uPay.
 * Landlines are rejected — Bit only charges a mobile that has the app.
 */
export function toIsraeliMobileNational(rawInput: string): string | null {
  const e164 = toIsraeliE164(rawInput);
  if (!e164 || !e164.startsWith("+9725") || e164.length !== 13) return null;
  return `0${e164.slice(4)}`;
}
