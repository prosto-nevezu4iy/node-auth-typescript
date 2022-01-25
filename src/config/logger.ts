import pino from 'pino';
import config from './config';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'yyyy-dd-mm, h:MM:ss TT',
    },
  },
  level: config.env === 'development' ? 'debug' : 'info',
});

export default logger;
