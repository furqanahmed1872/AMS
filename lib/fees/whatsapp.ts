/**
 * Normalizes a Pakistani phone number to the digits-only international
 * format wa.me expects (923XXXXXXXXX). Handles common input shapes:
 * "0300-1234567", "03001234567", "+923001234567", "923001234567".
 * Returns null if the result doesn't look like a valid PK mobile number.
 */
export function normalizePkPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  if (digits.startsWith("92") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 11)
    return `92${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("3")) return `92${digits}`;

  return null;
}

export function buildFeeReminderLink(
  phone: string,
  studentName: string,
  className: string,
  amountDue: number,
  monthLabel: string,
): string | null {
  const normalized = normalizePkPhone(phone);
  if (!normalized) return null;

  const message =
    `Dear Parent,\n\n` +
    `This is a reminder that ${studentName}'s (${className}) fee of Rs. ${amountDue} ` +
    `for ${monthLabel} is still pending.\n\n` +
    `Kindly clear it at your earliest convenience. Thank you.`;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildReceiptWhatsAppLink(
  phone: string,
  studentName: string,
  className: string,
  amountPaid: number,
  monthLabel: string,
): string | null {
  const normalized = normalizePkPhone(phone);
  if (!normalized) return null;

  const message =
    `Dear Parent,\n\n` +
    `We have received ${studentName}'s (${className}) fee payment of Rs. ${amountPaid} ` +
    `for ${monthLabel}.\n\n` +
    `Thank you.`;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
