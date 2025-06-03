// src/utils/logger.ts
import log from 'loglevel';

const Logger = {
  info: (message: string, context?: any) => {
    console.info(message, context);
    log.info(message, context);
  },
  warn: (message: string, context?: any) => {
    console.warn(message, context);
    log.warn(message, context);
  },
  error: (message: string, context?: any) => {
    console.error(message, context);
    log.error(message, context);
  },
  debug: (message: string, context?: any) => {
    console.debug(message, context);
    log.debug(message, context);
  }
};

export default Logger;