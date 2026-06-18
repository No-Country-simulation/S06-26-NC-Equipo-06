import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.handler';
import rateLimit from 'express-rate-limit';
import authUsersRoutes from './modules/auth_users/auth.users.routes';

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        status: 429,
        error: 'Demasiadas peticiones. Por favor, intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter)

app.use(cors(
    {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }
));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth-users', authUsersRoutes);

app.use(errorHandler);

export default app;
