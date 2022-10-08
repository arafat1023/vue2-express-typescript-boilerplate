import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import logger from 'morgan';
import cors from 'cors';
import { getAppInfo } from 'utilities';
import { suppressApiLogging } from './configs/server.config.json';

import * as AuthService from './modules/auth/AuthService';
import coreRouter from './routes';
import db from './db';
import './services/queues';

const app = express();

const {
  IS_DEVELOPMENT,
  ROUTE_API,
} = getAppInfo();

app.all(`${ROUTE_API}/ping`, (req, res) => {
  res.json({ message: 'pong' });
});

db();

app.use(AuthService.getAuthenticator());

if (!suppressApiLogging) {
  app.use(logger('dev'));
}

if (IS_DEVELOPMENT) {
  app.use(cors());
}

app.get('/test-report', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test-report', 'report.html'));
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const filesDir = path.join(__dirname, '..', 'files');
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, filesDir);
  },
  filename(req, file, callback) {
    // remain original file name
    callback(null, file.originalname);
  },
});

const upload = multer({
  storage,
});
app.use(upload.any());

app.use(ROUTE_API, coreRouter);

export default app;
