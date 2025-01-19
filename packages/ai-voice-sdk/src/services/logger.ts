type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level: LogLevel;
  timestamp?: boolean;
  prefix?: string;
}

export class LoggerService {
  private options: LogOptions;

  constructor(options: Partial<LogOptions> = {}) {
    this.options = {
      level: options.level || 'info',
      timestamp: options.timestamp !== false,
      prefix: options.prefix || '[AIVoice]'
    };
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = this.options.timestamp ? `[${new Date().toISOString()}]` : '';
    const prefix = this.options.prefix;
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `${timestamp} ${prefix} ${level.toUpperCase()}: ${message}${dataStr}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: Error, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, { ...data, error: error?.message }));
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.options.level);
  }
} 