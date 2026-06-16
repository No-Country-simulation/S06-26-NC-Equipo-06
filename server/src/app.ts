import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.handler';
import authUsersRoutes from './modules/auth_users/auth.users.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth-users', authUsersRoutes);

app.use(errorHandler);

export default app;
