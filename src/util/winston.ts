import appRoot from 'app-root-path';
import { Options } from 'morgan';
import winston, { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const Sentry = require('winston-sentry-raven-transport');
const winstonElasticSearch = require('winston-elasticsearch');
const os = require('os');
import config from 'config';
import http = require('http');

const transport = new DailyRotateFile({
  datePattern: 'YYYY-MM-DD',
  filename: `${appRoot}/logs/app_%DATE%.log`,
  maxSize: '20m',
  zippedArchive: false,
});

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    return Object.assign({
      message: info.message,
      stack: info.stack
    }, info);
  }
  return info;
});

const options = {
  file: {
    datePattern: 'YYYY-MM-DD',
    filename: `${appRoot}/logs/app_%DATE%.log`,
    maxSize: '20m',
    zippedArchive: true,
    level: 'info',
    handleExceptions: true,
    json: true
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  }
};

const sentryDsn = config.get<string>('sentry.dsn');
const streamingLogs = config.get<string>('sentry.streaming-logs');
const sentryOptions = {
  dsn: sentryDsn,
  level: 'warn',
  levelsMap: {
    info: 'info',
    debug: 'debug',
    warn: 'warning',
    error: 'error'
  },
  install: true
};

export const logger = winston.createLogger({
  transports: [
    new DailyRotateFile(options.file),
    ...(streamingLogs ? [new Sentry(sentryOptions), ] : [new winston.transports.Console(options.console)]),
  ],
  exitOnError: false, // do not exit on handled exceptions
});
