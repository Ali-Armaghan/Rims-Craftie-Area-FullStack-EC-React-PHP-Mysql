/**
 * Validates Pakistani and standard international phone numbers.
 * Supports formats:
 * - 0300 1234567 / 0300-1234567 / 03001234567 (11 digits starting with 03)
 * - +92 300 1234567 / +923001234567 (12 digits starting with +923)
 * - 923001234567 (12 digits starting with 923)
 * - 3001234567 (10 digits starting with 3)
 * - Landlines: 021-34567890, 042-35789012 (10-11 digits starting with 0)
 * - International: 10-15 digits with valid prefix
 */
export function validatePhoneNumber(phone: string | null | undefined): {
  isValid: boolean;
  message?: string;
} {
  const trimmed = (phone ?? "").trim();

  if (!trimmed) {
    return {
      isValid: false,
      message: "Contact number is required.",
    };
  }

  // Check for allowed characters: digits, spaces, dashes, plus, parentheses
  if (!/^[+]?[\d\s\-()]{7,25}$/.test(trimmed)) {
    return {
      isValid: false,
      message: "Phone number contains invalid characters.",
    };
  }

  const digits = trimmed.replace(/\D/g, "");
  const hasPlus = trimmed.startsWith("+");

  // Too short or too long
  if (digits.length < 10) {
    return {
      isValid: false,
      message: "Phone number is too short (e.g. 0300 1234567).",
    };
  }

  if (digits.length > 15) {
    return {
      isValid: false,
      message: "Phone number is too long.",
    };
  }

  // Pakistani mobile validation
  // Case 1: starts with 03 -> must have exactly 11 digits
  if (digits.startsWith("03")) {
    if (digits.length !== 11) {
      return {
        isValid: false,
        message: "Pakistani mobile number must be 11 digits (e.g. 0300 1234567).",
      };
    }
    return { isValid: true };
  }

  // Case 2: starts with 923 or +923 -> must have 12 digits
  if (digits.startsWith("923")) {
    if (digits.length !== 12) {
      return {
        isValid: false,
        message: "Pakistani number with +92 must be 12 digits (e.g. +92 300 1234567).",
      };
    }
    return { isValid: true };
  }

  // Case 3: starts with 3 (missing 0) and has 10 digits
  if (digits.startsWith("3") && digits.length === 10) {
    return { isValid: true };
  }

  // Case 4: Other Pakistani landlines starting with 0 (e.g. 021, 042, 051)
  if (digits.startsWith("0") && (digits.length === 10 || digits.length === 11)) {
    return { isValid: true };
  }

  // Case 5: International numbers
  if (hasPlus || digits.startsWith("92") || (digits.length >= 10 && digits.length <= 15)) {
    return { isValid: true };
  }

  return {
    isValid: false,
    message: "Please enter a valid phone number (e.g. 0300 1234567).",
  };
}

export function formatPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("03") && digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  if (digits.startsWith("923") && digits.length === 12) {
    return `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return phone;
}
