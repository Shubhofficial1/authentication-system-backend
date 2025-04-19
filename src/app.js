import express from 'express';
import path from 'path';
import router from './router/apiRouter.js';
import { globalErrorHandler, notFound } from './middleware/globalErrorHandler.js';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

const __dirname = path.resolve();

app.use(helmet());
app.use(cookieParser());
app.use(
    cors({
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        // TODO: Change below origin based on frontend server accordingly
        origin: ['http://www.domain.com'],
        credentials: true
    })
);
app.use(express.json());
app.use(express.static(path.join(__dirname + 'public')));

app.use('/api/v1', router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
