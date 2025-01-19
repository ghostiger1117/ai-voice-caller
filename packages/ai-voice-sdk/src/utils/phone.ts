import { AIVoiceError, ErrorCodes } from './errors';

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid phone number
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new AIVoiceError(
      'Invalid phone number length',
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // Add + prefix if not present
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

export function validatePhoneNumber(phone: string): boolean {
  try {
    formatPhoneNumber(phone);
    return true;
  } catch {
    return false;
  }
} 