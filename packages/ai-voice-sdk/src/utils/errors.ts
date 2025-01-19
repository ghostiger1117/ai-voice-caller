export const ErrorCodes = {
  INVALID_CONFIG: 'INVALID_CONFIG',
  TWILIO_ERROR: 'TWILIO_ERROR',
  ELEVENLABS_ERROR: 'ELEVENLABS_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  CALL_FAILED: 'CALL_FAILED',
  SMS_FAILED: 'SMS_FAILED',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;

export class AIVoiceError extends Error {
  code: keyof typeof ErrorCodes;
  details?: any;

  constructor(message: string, code: keyof typeof ErrorCodes, details?: any) {
    super(message);
    this.name = 'AIVoiceError';
    this.code = code;
    this.details = details;
  }
} 