import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import httpStatus from 'http-status';
import xss from 'xss-clean';
import compression from 'compression';
import cors from 'cors';
import loggerMiddleware from './config/httpLogger';
import 'reflect-metadata';
import config from './config/config';
import routes from './routes/index';
import { errorConverter, errorHandler } from './middlewares/error';
import jwtStrategy from './config/passport';
import { ApiError } from './utils/ApiError';

const app = express();

if (config.env !== 'test') {
  app.use(loggerMiddleware);
}

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.use('/', routes);

// send back a 404 error for any unknown api request
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
