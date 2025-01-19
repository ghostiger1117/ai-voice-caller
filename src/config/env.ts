import dotenv from 'dotenv';
import { cleanEnv, str, port } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  PORT: port({ default: 3000 }),
  TWILIO_ACCOUNT_SID: str(),
  TWILIO_AUTH_TOKEN: str(),
  TWILIO_PHONE_NUMBER: str(),
  OPENAI_API_KEY: str(),
  ELEVENLABS_API_KEY: str(),
  ELEVENLABS_VOICE_ID: str(),
  ELEVENLABS_AGENT_ID: str(),
  APP_URL: str(),
  APP_VERSION: str({ default: '1.0.0' }),
}); 