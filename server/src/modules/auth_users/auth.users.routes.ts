import express from 'express';
import * as authController from './auth.users.controller';
import { refreshToken } from '../../middlewares/refresh.token.middleware';
import { tokenMiddleware } from '../../middlewares/token.middleware';

const router = express.Router();

router.post('/register', authController.registerController);

router.post('/verify-email/:token', authController.verifyEmailController);

router.post('/resend-verification-email/:email', authController.resendVerificationEmailController);

router.post('/login', authController.loginController);

router.get('/verify-auth', tokenMiddleware, refreshToken, authController.verifyAuthController);

router.post('/logout', refreshToken, tokenMiddleware, authController.logoutController);

export default router;