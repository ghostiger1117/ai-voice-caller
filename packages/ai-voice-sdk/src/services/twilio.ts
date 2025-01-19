import { Twilio } from 'twilio';
import { AIVoiceConfig } from '../types';
import { AIVoiceError, ErrorCodes } from '../utils/errors';

export class TwilioService {
  private client: Twilio;
  private config: AIVoiceConfig;

  constructor(config: AIVoiceConfig) {
    this.config = config;
    this.client = new Twilio(config.twilioAccountSid, config.twilioAuthToken);
  }

  async makeCall(options: {
    to: string;
    audioUrl: string;
    callbackUrl?: string;
    webhookEvents?: string[];
  }) {
    try {
      return await this.client.calls.create({
        to: options.to,
        from: this.config.twilioPhoneNumber,
        twiml: `<Response><Play>${options.audioUrl}</Play></Response>`,
        statusCallback: options.callbackUrl,
        statusCallbackEvent: options.webhookEvents,
        machineDetection: 'DetectMessageEnd',
        asyncAmd: 'true'
      });
    } catch (error) {
      throw new AIVoiceError(
        `Failed to make call: ${(error as Error).message}`,
        ErrorCodes.TWILIO_ERROR,
        error
      );
    }
  }

  async sendSMS(to: string, message: string) {
    try {
      return await this.client.messages.create({
        to,
        from: this.config.twilioPhoneNumber,
        body: message
      });
    } catch (error) {
      throw new AIVoiceError(
        `Failed to send SMS: ${(error as Error).message}`,
        ErrorCodes.TWILIO_ERROR,
        error
      );
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.client.api.accounts(this.config.twilioAccountSid).fetch();
      return true;
    } catch {
      return false;
    }
  }

  async getCallStatus(callSid: string) {
    try {
      return await this.client.calls(callSid).fetch();
    } catch (error) {
      throw new AIVoiceError(
        `Failed to get call status: ${(error as Error).message}`,
        ErrorCodes.TWILIO_ERROR,
        error
      );
    }
  }

  async endCall(callSid: string) {
    try {
      return await this.client.calls(callSid)
        .update({ status: 'completed' });
    } catch (error) {
      throw new AIVoiceError(
        `Failed to end call: ${(error as Error).message}`,
        ErrorCodes.TWILIO_ERROR,
        error
      );
    }
  }

  async getCallHistory(limit: number) {
    try {
      return await this.client.calls.list({
        pageSize: limit,
      });
    } catch (error) {
      throw new AIVoiceError(
        'Failed to get call history',
        ErrorCodes.TWILIO_ERROR,
        error
      );
    }
  }
} 