import pino from 'pino';
import path from 'path';

const logsDir = path.join(__dirname, '../../logs');

const fileTransport = pino.transport({
  target: 'pino/file',
  options: {
    destination: path.join(logsDir, 'app.log'),
    mkdir: true,
    rotate: {
      size: '10M', // Rotate when file reaches 10MB
      interval: '1d', // Also rotate daily
      compress: true // Compress old logs
    }
  }
});

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  }
}, fileTransport); 