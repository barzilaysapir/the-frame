/**
 * uPay appends `errormessage` / `errordescription` on returnurl.
 * Hebrew descriptions are often double-encoded (UTF-8 read as Latin-1).
 */
export function repairUpayMojibake(value: string): string {
  try {
    const bytes = Uint8Array.from(value, (ch) => ch.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return decoded || value;
  } catch {
    return value;
  }
}

export function upayReturnErrorMessage(
  errorCode: string | null,
  errorDescription: string | null,
  copy: { userNotExists: string; paymentNotCompleted: string },
): string | null {
  if (!errorCode && !errorDescription) return null;
  if (errorCode === "USER_NOT_EXISTS") return copy.userNotExists;
  const description = errorDescription
    ? repairUpayMojibake(errorDescription).trim()
    : "";
  return description || copy.paymentNotCompleted;
}
