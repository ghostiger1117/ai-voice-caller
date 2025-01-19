import twilio, { Twilio, twiml } from 'twilio';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class TwilioService {
  private client: Twilio;

  constructor() {
    this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }

  generateTwiML() {
    return new twiml.VoiceResponse();
  }

  async makeCall(to: string, message: string) {
    try {
      const call = await this.client.calls.create({
        to,
        from: env.TWILIO_PHONE_NUMBER,
        url: `${env.APP_URL}/api/outbound/twiml?message=${encodeURIComponent(message)}`,
        statusCallback: `${env.APP_URL}/api/outbound/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      });

      logger.info({ callSid: call.sid }, 'Initiated outbound call');
      return call;
    } catch (error) {
      logger.error({ error }, 'Failed to make call');
      throw error;
    }
  }

  async sendSMS(to: string, message: string) {
    try {
      return await this.client.messages.create({
        to,
        from: env.TWILIO_PHONE_NUMBER,
        body: message
      });
    } catch (error) {
      logger.error({ error }, 'Failed to send SMS');
      throw error;
    }
  }
}
