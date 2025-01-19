# AI Voice Caller SDK

Create AI-powered voice calls with natural language processing and voice synthesis.

## Features

| Category | Features |
|----------|----------|
| Voice Calls | • Outbound calls<br>• SMS messaging<br>• Real-time call monitoring<br>• Call status tracking<br>• Concurrent call handling |
| AI Integration | • Natural voice synthesis<br>• Multi-voice support<br>• Emotion detection<br>• Conversation management<br>• Context awareness |
| Analytics | • Call metrics tracking<br>• Cost monitoring<br>• Success rate analysis<br>• Duration tracking<br>• Sentiment analysis |
| Developer Tools | • WebSocket monitoring<br>• Caching system<br>• Rate limiting<br>• Health checks<br>• Detailed logging |

## Installation

```bash
npm install @atrix.dev/ai-voice-sdk

```

## Quick Start

```typescript
import { AIVoiceCaller } from '@atrix.dev/ai-voice-sdk';

// Initialize the SDK
const voiceCaller = new AIVoiceCaller({
  apiKey: 'your_api_key',
  twilioAccountSid: 'your_twilio_sid',
  twilioAuthToken: 'your_twilio_token',
  twilioPhoneNumber: 'your_twilio_number',
  elevenLabsApiKey: 'your_elevenlabs_key',
  elevenLabsVoiceId: 'your_voice_id'
});

// Make a call
const result = await voiceCaller.makeCall({
  to: '+1234567890',
  message: 'Hello from AI Voice!'
});

// Send an SMS
const sms = await voiceCaller.sendSMS(
  '+1234567890', 
  'Hello from AI Voice!'
);
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| apiKey | string | ✓ | - | Your Atrix API key |
| twilioAccountSid | string | ✓ | - | Twilio Account SID |
| twilioAuthToken | string | ✓ | - | Twilio Auth Token |
| twilioPhoneNumber | string | ✓ | - | Your Twilio phone number |
| elevenLabsApiKey | string | ✓ | - | ElevenLabs API key |
| elevenLabsVoiceId | string | ✓ | - | ElevenLabs voice ID |
| baseUrl | string | - | https://api.atrix.dev | API base URL |
| logLevel | string | - | 'info' | Logging level (debug/info/warn/error) |
| maxConcurrentCalls | number | - | 5 | Maximum concurrent calls |
| cacheTTL | number | - | 300000 | Cache TTL in milliseconds |
| cacheMaxSize | number | - | 1000 | Maximum cache entries |
| retryAttempts | number | - | 3 | Number of retry attempts |
| timeout | number | - | 30000 | Request timeout in milliseconds |

## API Reference

### Voice Calls

```typescript
// Make a voice call
const call = await voiceCaller.makeCall({
  to: '+1234567890',
  message: 'Hello!',
  voiceSettings: {
    stability: 0.7,
    similarityBoost: 0.5,
    style: 0.5,
    useSpeakerBoost: true
  }
});

// End a call
await voiceCaller.endCall('call_id');

// Get call history
const history = await voiceCaller.getCallHistory(10);

// Get call metrics
const metrics = await voiceCaller.getCallMetrics('call_id');
```

### SMS Messaging

```typescript
// Send SMS
const sms = await voiceCaller.sendSMS(
  '+1234567890',
  'Hello from AI Voice!'
);
```

### Real-time Monitoring

```typescript
// Listen for call status updates
voiceCaller.onCallStatus((status) => {
  console.log('Call status:', status);
});

// Listen for errors
voiceCaller.onError((error) => {
  console.error('Error:', error);
});
```

### Analytics & Metrics

```typescript
// Get aggregate metrics
const metrics = await voiceCaller.getMetrics();

// Get conversation transcript
const transcript = await voiceCaller.getConversationTranscript('call_id', {
  format: 'json',
  includeTiming: true,
  speakerLabels: true
});
```

## Error Handling

| Error Code | Description | Common Causes |
|------------|-------------|---------------|
| INVALID_CONFIG | Configuration error | Missing required fields, invalid format |
| TWILIO_ERROR | Twilio API error | Invalid credentials, rate limits |
| ELEVENLABS_ERROR | ElevenLabs API error | Invalid API key, voice ID |
| NETWORK_ERROR | Network request failed | Timeout, connection issues |
| CALL_FAILED | Call operation failed | Invalid phone number, service unavailable |
| SMS_FAILED | SMS operation failed | Invalid phone number, service unavailable |
| VALIDATION_ERROR | Input validation failed | Invalid phone format, missing data |

## Best Practices

1. **Rate Limiting**
   - Monitor your API usage
   - Implement proper error handling
   - Use the built-in rate limiter

2. **Resource Management**
   - Clean up resources with `disconnect()`
   - Monitor memory usage with metrics
   - Use caching for frequent requests

3. **Error Handling**
   - Always implement error handlers
   - Use try-catch blocks
   - Monitor error rates

4. **Performance**
   - Enable caching for repeated calls
   - Use concurrent call limits
   - Monitor call metrics

## Examples

### Advanced Call Setup

```typescript
const call = await voiceCaller.makeCall({
  to: '+1234567890',
  message: 'Hello!',
  voiceSettings: {
    stability: 0.7,
    similarityBoost: 0.5,
    style: 0.5,
    useSpeakerBoost: true
  },
  webhookEvents: ['initiated', 'ringing', 'answered', 'completed'],
  callbackUrl: 'https://your-webhook.com/callback'
});
```

### Health Monitoring

```typescript
// Check service health
const isHealthy = await voiceCaller.checkHealth();

// Clear cache if needed
await voiceCaller.clearCache();

// Disconnect services
voiceCaller.disconnect();
```

## Support

- Documentation: [https://docs.atrix.dev/developers/ai-voice-sdk](https://docs.atrix.dev/developers/ai-voice-sdk)
- Issues: [GitHub Issues](https://github.com/atrix/ai-voice-sdk/issues)
- Email: support@atrix.dev

## License

MIT
