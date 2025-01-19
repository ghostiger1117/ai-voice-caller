import { AIVoiceError, ErrorCodes } from '../utils/errors';

interface ConversationState {
  callId: string;
  turns: Array<{
    speaker: 'user' | 'system';
    message: string;
    timestamp: number;
  }>;
  metadata: Record<string, any>;
}

export class ConversationManager {
  private conversations: Map<string, ConversationState>;

  constructor() {
    this.conversations = new Map();
  }

  createConversation(callId: string, metadata: Record<string, any> = {}) {
    this.conversations.set(callId, {
      callId,
      turns: [],
      metadata
    });
  }

  addTurn(callId: string, speaker: 'user' | 'system', message: string) {
    const conversation = this.conversations.get(callId);
    if (!conversation) {
      throw new AIVoiceError(
        'Conversation not found',
        ErrorCodes.INVALID_CONFIG
      );
    }

    conversation.turns.push({
      speaker,
      message,
      timestamp: Date.now()
    });
  }

  getConversation(callId: string): ConversationState {
    const conversation = this.conversations.get(callId);
    if (!conversation) {
      throw new AIVoiceError(
        'Conversation not found',
        ErrorCodes.INVALID_CONFIG
      );
    }
    return conversation;
  }
} 