# AI Voice SDK Basic Usage Example

This example demonstrates basic usage of the @atrix.dev/ai-voice-sdk package.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a .env file with your credentials:
```env
API_KEY=your_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_voice_id
```

3. Update the phone number in index.ts with your test number.

4. Run the example:
```bash
npm start
```

## Expected Output

The example will:
1. Make an outbound call with synthesized voice
2. Send a test SMS
3. Log the results of both operations 