import { createLogger, transport } from 'winston';
import LokiTransport from 'winston-loki';

const options = {
  transports: [
    new LokiTransport({
      host: 'http://192.168.29.143:3100',
    }),
  ],
};
export const logger = createLogger(options);
