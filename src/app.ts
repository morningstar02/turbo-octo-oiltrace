import appRoot from 'app-root-path';
import bodyParser from 'body-parser';
import config from 'config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import fileUpload from 'express-fileupload';
import expressValidator from 'express-validator';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import IController from './common/controller-interface';
import { LoadMetadata } from './controllers/util/load-metadata';
import errorHandler from './error/error-handler';
import { logger } from './util/winston';
const Sentry = require('@sentry/node');

class App {
  public app: express.Application;

  constructor(controllers: IController[]) {
    this.app = express();
    this.initializeSentry();
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.loadMetadata();
    this.initializeControllers(controllers);
    this.initializeErrorHandler();
  }

  public listen() {
    this.app.listen(3000, () => {
      logger.info('App listening on the port 3000');
    });
  }

  public getServer() {
    return this.app;
  }

  private async initializeDatabase() {
    const options = {
      // If not connected, return errors immediately rather than waiting for reconnect
      bufferMaxEntries: 0,
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      poolSize: 10, // Maintain up to 10 socket connections
      reconnectTries: 300,
      reconnectInterval: 1000, // Reconnect every 500ms
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      useFindAndModify: false,  // deprecation warning
    };

    mongoose.Promise = require('bluebird');
    const connectWithRetry = () => {
      logger.info('MongoDB connection with retry');
      mongoose.connect(config.get<string>('database'), options).then(() => {
        logger.info('MongoDB is connected');
      }).catch((err) => {
        logger.info('MongoDB connection unsuccessful, retry after 5 seconds.');
        setTimeout(connectWithRetry, 5000);
      });
    };

    connectWithRetry();
  }

  private initializeMiddlewares() {
    // Middleware for CORS
    this.app.use(cors());

    // Middlewares for bodyparsing using both json and urlencoding
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json({ limit: '50mb' }));

    this.initializeMorgan();

    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(expressValidator());
    this.app.use(fileUpload());
    /*this.app.use(express.static(path.join(__dirname, "public")));
    this.app.use(favicon(path.join(__dirname, "public", "favicon.ico")));*/
  }

  private initializeSentry() {
    const sentryDsn = config.get<string>('sentry.dsn');
    Sentry.init({ dsn: sentryDsn });
    this.app.use(Sentry.Handlers.errorHandler());
  }

  private initializeMorgan() {
    const fs = require('fs');

    // placeholder incase we want daily log rotation of access log
    /*var accessLogStream = rfs('access.log', {
      interval: '1d', // rotate daily
      path: path.join(`${appRoot}/logs`, 'logs')
    });*/
    const accessLogStream = fs.createWriteStream(
      path.join(`${appRoot}/logs`, 'access.log'),
      { flags: 'a' },
    );
    this.app.use(morgan('combined', { stream: accessLogStream }));
  }

  private async loadMetadata() {
    await new LoadMetadata().load();
  }

  private initializeControllers(controllers: IController[]) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  private initializeErrorHandler() {
    this.app.use(errorHandler);
  }
}

export default App;
