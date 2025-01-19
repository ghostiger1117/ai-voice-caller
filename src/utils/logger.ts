import pino from 'pino';
import path from 'path';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true
        },
        level: 'info'
      },
      {
        target: 'pino/file',
        options: {
          destination: path.join(__dirname, '../../logs/app.log'),
          mkdir: true
        },
        level: 'debug'
      }
    ]
  }
}); 