import { 
  AIVoiceConfig, 
  CallOptions, 
  CallResponse, 
  CallMetrics, 
  AggregateMetrics,
  TranscriptOptions 
} from './types';
import { TwilioService } from './services/twilio';
import { ElevenLabsService } from './services/elevenlabs';
import { WebSocketService } from './services/websocket';
import { CacheService } from './services/cache';
import { QueueService } from './services/queue';
import { MetricsService } from './services/metrics';
import { LoggerService } from './services/logger';
import { AnalyticsService } from './services/analytics';
import { ConversationManager } from './services/conversation';
import { validateConfig, validateCallOptions } from './utils/validation';
import { AIVoiceError, ErrorCodes } from './utils/errors';
import { formatPhoneNumber } from './utils/phone';
import { TTSManager, TTSService } from './tts/index';
import {  TTSOptions } from './services/tts/base';

export class AIVoiceCaller {
  private config: AIVoiceConfig;
  private twilio: TwilioService;
  private elevenlabs: ElevenLabsService;
  private websocket: WebSocketService;
  private cache: CacheService<any>;
  private queue: QueueService<CallOptions>;
  private metrics: MetricsService;
  private logger: LoggerService;
  private analytics: AnalyticsService;
  private conversations: ConversationManager;
  private tts: TTSService;

  constructor(config: AIVoiceConfig) {
    validateConfig(config);
    this.config = config;
    
    // Initialize services
    this.logger = new LoggerService({ level: config.logLevel });
    this.twilio = new TwilioService(config);
    this.elevenlabs = new ElevenLabsService(config);
    this.websocket = new WebSocketService(config);
    this.cache = new CacheService({
      ttl: config.cacheTTL,
      maxSize: config.cacheMaxSize
    });
    this.metrics = new MetricsService();
    this.analytics = new AnalyticsService(config);
    this.conversations = new ConversationManager();
    
    // Initialize queue with call processor
    this.queue = new QueueService(
      async (options: CallOptions) => this.processCall(options),
      config.maxConcurrentCalls
    );

    // Setup websocket connection
    this.websocket.connect();

    this.tts = new TTSService({
      providers: [
        {
          name: 'elevenlabs',
          enabled: true,
          priority: 1,
          config: {
            apiKey: config.elevenLabsApiKey,
            voiceId: config.elevenLabsVoiceId
          }
        }
      ],
      logLevel: config.logLevel
    });
  }

  async makeCall(options: CallOptions): Promise<CallResponse> {
    validateCallOptions(options);
    const response = await this.queue.add(options.to, options);
    return response as CallResponse;
  }

  async sendSMS(to: string, message: string): Promise<CallResponse> {
    try {
      const formattedNumber = formatPhoneNumber(to);
      const sms = await this.twilio.sendSMS(formattedNumber, message);
      
      const response: CallResponse = {
        callId: sms.sid,
        status: 'initiated',
        message: 'SMS sent successfully',
        details: {
          to: formattedNumber,
          from: this.config.twilioPhoneNumber,
          body: message
        }
      };

      await this.analytics.trackCall({
        callId: sms.sid,
        duration: 0,
        status: 'completed',
        from: this.config.twilioPhoneNumber,
        to: formattedNumber,
        type: 'sms'
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to send SMS', error as Error);
      throw new AIVoiceError(
        'Failed to send SMS',
        ErrorCodes.SMS_FAILED,
        error
      );
    }
  }

  async getCallHistory(limit: number = 10): Promise<CallResponse[]> {
    try {
      const calls = await this.twilio.getCallHistory(limit);
      return calls.map(call => ({
        callId: call.sid,
        status: this.normalizeCallStatus(call.status),
        message: `Call ${call.status}`,
        details: {
          to: call.to,
          from: call.from,
          duration: call.duration ? parseInt(call.duration) : undefined
        }
      }));
    } catch (error) {
      this.logger.error('Failed to get call history', error as Error);
      throw new AIVoiceError(
        'Failed to get call history',
        ErrorCodes.TWILIO_ERROR,
        error
      );
    }
  }

  private normalizeCallStatus(status: string): CallResponse['status'] {
    const statusMap: { [key: string]: CallResponse['status'] } = {
      'queued': 'initiated',
      'ringing': 'ringing',
      'in-progress': 'in-progress',
      'completed': 'completed',
      'busy': 'busy',
      'no-answer': 'no-answer',
      'canceled': 'canceled',
      'failed': 'failed'
    };
    return statusMap[status] || 'failed';
  }

  async endCall(callId: string): Promise<void> {
    try {
      await this.twilio.endCall(callId);
      this.logger.info(`Call ${callId} ended successfully`);
    } catch (error) {
      this.logger.error(`Failed to end call ${callId}`, error as Error);
      throw new AIVoiceError(
        'Failed to end call',
        ErrorCodes.TWILIO_ERROR,
        error
      );
    }
  }

  async getConversationTranscript(
    callId: string,
    options: TranscriptOptions = {}
  ): Promise<string> {
    try {
      const conversation = this.conversations.getConversation(callId);
      
      if (options.format === 'json') {
        return JSON.stringify(conversation.turns);
      }

      if (options.format === 'html') {
        return conversation.turns
          .map(turn => {
            const timestamp = options.includeTiming 
              ? `<time>${new Date(turn.timestamp).toISOString()}</time>` 
              : '';
            const speaker = options.speakerLabels 
              ? `<strong>${turn.speaker}:</strong> ` 
              : '';
            return `<p>${timestamp}${speaker}${turn.message}</p>`;
          })
          .join('\n');
      }

      // Default text format
      return conversation.turns
        .map(turn => {
          const timestamp = options.includeTiming 
            ? `[${new Date(turn.timestamp).toISOString()}] ` 
            : '';
          const speaker = options.speakerLabels 
            ? `${turn.speaker}: ` 
            : '';
          return `${timestamp}${speaker}${turn.message}`;
        })
        .join('\n');
    } catch (error) {
      this.logger.error(`Failed to get transcript for call ${callId}`, error as Error);
      throw new AIVoiceError(
        'Failed to get conversation transcript',
        ErrorCodes.INVALID_CONFIG,
        error
      );
    }
  }

  async getMetrics(): Promise<AggregateMetrics> {
    return this.metrics.getAggregateMetrics();
  }

  async getCallMetrics(callId: string): Promise<CallMetrics | undefined> {
    return this.metrics.getCallMetrics(callId);
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    this.logger.info('Cache cleared successfully');
  }

  onCallStatus(callback: (status: any) => void): void {
    this.websocket.on('call_status', callback);
  }

  onError(callback: (error: Error) => void): void {
    this.websocket.on('error', callback);
  }

  disconnect(): void {
    this.websocket.close();
    this.logger.info('Disconnected from WebSocket');
  }

  private async processCall(options: CallOptions): Promise<CallResponse> {
    try {
      const startTime = Date.now();
      
      let audioUrl = options.audioUrl;
      if (options.message && !audioUrl) {
        audioUrl = await this.elevenlabs.generateSpeech(
          options.message,
          options.voiceSettings
        );
      }

      const call = await this.twilio.makeCall({
        to: formatPhoneNumber(options.to),
        audioUrl: audioUrl!,
        callbackUrl: options.callbackUrl,
        webhookEvents: options.webhookEvents || ['initiated', 'ringing', 'answered', 'completed']
      });

      const duration = (Date.now() - startTime) / 1000;
      
      // Track metrics and analytics
      this.metrics.trackCall(call.sid, {
        duration,
        status: 'completed',
        cost: this.calculateCost(duration)
      });

      await this.analytics.trackCall({
        callId: call.sid,
        duration,
        status: 'completed',
        from: this.config.twilioPhoneNumber,
        to: options.to,
        type: 'voice'
      });

      return {
        callId: call.sid,
        status: 'initiated',
        message: 'Call initiated successfully',
        details: {
          to: options.to,
          from: this.config.twilioPhoneNumber,
          duration: parseInt(call.duration),
          callbackUrl: options.callbackUrl
        }
      };
    } catch (error) {
      this.logger.error('Call processing failed', error as Error);
      throw error;
    }
  }

  private calculateCost(duration: number): number {
    const voiceCost = duration * 0.02; // $0.02 per second for voice
    const aiCost = duration * 0.01;    // $0.01 per second for AI processing
    return voiceCost + aiCost;
  }

  async generateSpeech(text: string, options?: TTSOptions): Promise<Buffer> {
    return this.tts.generateSpeech(text, options);
  }
}

export * from './types';
export * from './utils/errors';
export * from './services/tts/base'; 