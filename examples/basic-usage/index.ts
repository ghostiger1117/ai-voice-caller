import { AIVoiceCaller } from '@atrix.dev/ai-voice-sdk';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
  // Validate required env vars
  const requiredEnvVars = [
    'API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'ELEVENLABS_API_KEY',
    'ELEVENLABS_VOICE_ID'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  // Initialize the SDK
  const voiceCaller = new AIVoiceCaller({
    apiKey: process.env.API_KEY!,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID!,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN!,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER!,
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY!,
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID!
  });

  try {
    // Make an outbound call
    console.log('Initiating call...');
    const callResult = await voiceCaller.makeCall({
      to: '+1234567890', // Replace with your test phone number
      message: 'Hello! This is a test call from AI Voice Caller.',
      callbackUrl: 'https://your-webhook.com/status',
      webhookEvents: ['initiated', 'ringing', 'answered', 'completed']
    });

    console.log('Call Result:', callResult);

    // Send an SMS
    console.log('Sending SMS...');
    const smsResult = await voiceCaller.sendSMS(
      '+1234567890', // Replace with your test phone number
      'Hello from AI Voice Caller!'
    );

    console.log('SMS Result:', smsResult);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(console.error); 