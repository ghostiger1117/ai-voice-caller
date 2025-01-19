import { AIVoiceConfig, CallOptions, VoiceSettings } from '../types';
import { AIVoiceError, ErrorCodes } from './errors';
import { validatePhoneNumber } from './phone';

export function validateConfig(config: AIVoiceConfig): void {
  const requiredFields: (keyof AIVoiceConfig)[] = [
    'apiKey',
    'twilioAccountSid',
    'twilioAuthToken',
    'twilioPhoneNumber',
    'elevenLabsApiKey',
    'elevenLabsVoiceId'
  ];

  // Check for missing required fields
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new AIVoiceError(
        `Missing required configuration field: ${field}`,
        ErrorCodes.INVALID_CONFIG
      );
    }
  }

  // Validate phone number format
  if (!validatePhoneNumber(config.twilioPhoneNumber)) {
    throw new AIVoiceError(
      'Invalid Twilio phone number format',
      ErrorCodes.INVALID_CONFIG
    );
  }

  // Validate optional fields
  if (config.logLevel && !['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
    throw new AIVoiceError(
      'Invalid log level. Must be one of: debug, info, warn, error',
      ErrorCodes.INVALID_CONFIG
    );
  }

  if (config.maxConcurrentCalls && (config.maxConcurrentCalls < 1 || config.maxConcurrentCalls > 100)) {
    throw new AIVoiceError(
      'maxConcurrentCalls must be between 1 and 100',
      ErrorCodes.INVALID_CONFIG
    );
  }

  if (config.cacheTTL && config.cacheTTL < 0) {
    throw new AIVoiceError(
      'cacheTTL must be a positive number',
      ErrorCodes.INVALID_CONFIG
    );
  }

  if (config.timeout && config.timeout < 1000) {
    throw new AIVoiceError(
      'timeout must be at least 1000ms',
      ErrorCodes.INVALID_CONFIG
    );
  }
}

export function validateCallOptions(options: CallOptions): void {
  // Validate required fields
  if (!options.to) {
    throw new AIVoiceError(
      'Destination phone number is required',
      ErrorCodes.INVALID_CONFIG
    );
  }

  // Validate phone number format
  if (!validatePhoneNumber(options.to)) {
    throw new AIVoiceError(
      'Invalid destination phone number format',
      ErrorCodes.INVALID_CONFIG
    );
  }

  // Validate that either message or audioUrl is provided
  if (!options.message && !options.audioUrl) {
    throw new AIVoiceError(
      'Either message or audioUrl must be provided',
      ErrorCodes.INVALID_CONFIG
    );
  }

  // Validate voice settings if provided
  if (options.voiceSettings) {
    validateVoiceSettings(options.voiceSettings);
  }

  // Validate webhook events if provided
  if (options.webhookEvents) {
    const validEvents = ['initiated', 'ringing', 'answered', 'completed'];
    for (const event of options.webhookEvents) {
      if (!validEvents.includes(event)) {
        throw new AIVoiceError(
          `Invalid webhook event: ${event}. Must be one of: ${validEvents.join(', ')}`,
          ErrorCodes.INVALID_CONFIG
        );
      }
    }
  }

  // Validate callback URL if provided
  if (options.callbackUrl) {
    try {
      new URL(options.callbackUrl);
    } catch {
      throw new AIVoiceError(
        'Invalid callback URL format',
        ErrorCodes.INVALID_CONFIG
      );
    }
  }
}

function validateVoiceSettings(settings: VoiceSettings): void {
  const { stability, similarityBoost, style, useSpeakerBoost } = settings;

  // Validate number ranges
  if (stability < 0 || stability > 1) {
    throw new AIVoiceError(
      'Voice stability must be between 0 and 1',
      ErrorCodes.INVALID_CONFIG
    );
  }

  if (similarityBoost < 0 || similarityBoost > 1) {
    throw new AIVoiceError(
      'Voice similarity boost must be between 0 and 1',
      ErrorCodes.INVALID_CONFIG
    );
  }

  if (style < 0 || style > 1) {
    throw new AIVoiceError(
      'Voice style must be between 0 and 1',
      ErrorCodes.INVALID_CONFIG
    );
  }

  if (typeof useSpeakerBoost !== 'boolean') {
    throw new AIVoiceError(
      'useSpeakerBoost must be a boolean',
      ErrorCodes.INVALID_CONFIG
    );
  }
} 