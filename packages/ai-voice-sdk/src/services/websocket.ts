import WebSocket from 'ws';
import { AIVoiceConfig } from '../types';
import { AIVoiceError, ErrorCodes } from '../utils/errors';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: AIVoiceConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: AIVoiceConfig) {
    this.config = config;
  }

  connect() {
    const wsUrl = `${this.config.baseUrl?.replace('http', 'ws') || 'wss://api.atrix.dev'}/v1/ws`;
    
    this.ws = new WebSocket(wsUrl, {
      headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
    });

    this.ws.on('open', () => this.handleOpen());
    this.ws.on('message', (data) => this.handleMessage(data));
    this.ws.on('error', (error) => this.handleError(error));
    this.ws.on('close', () => this.handleClose());
  }

  private handleOpen() {
    this.reconnectAttempts = 0;
    this.emit('connection', { status: 'connected' });
  }

  private handleMessage(data: WebSocket.Data) {
    try {
      const parsed = JSON.parse(data.toString());
      this.emit(parsed.event, parsed.data);
    } catch (error) {
      console.error('WebSocket message parse error:', error);
    }
  }

  private handleError(error: Error) {
    this.emit('error', error);
  }

  private handleClose() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  close() {
    this.ws?.close();
  }
} 