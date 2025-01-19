# AI Voice Caller SDK

Official SDK for AI Voice Caller - Create AI-powered voice calls with ease.

## Installation

bash
npm install @ai-voice/sdk
typescript
import { AIVoiceClient } from '@ai-voice/sdk';
const client = new AIVoiceClient({
apiKey: 'your_api_key'
});
// Make an outbound call
const call = await client.makeCall({
to: '+1234567890',
message: 'Hello from AI Voice!'
});


## Features

- 🎯 Simple and intuitive API
- 🔊 Natural voice synthesis with ElevenLabs
- 🤖 AI-powered conversations
- 📞 Seamless Twilio integration
- 🌍 Multi-language support
- ⚡ Real-time call status updates

## Documentation

Visit our [documentation](https://github.com/moeidsaleem/ai-voice-caller) for detailed usage instructions.