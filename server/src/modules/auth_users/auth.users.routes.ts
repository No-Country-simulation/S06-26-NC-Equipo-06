import express from 'express';
import * as authController from './auth.users.controller';
import { refreshToken } from '../../middlewares/refresh.token.middleware';
import { tokenMiddleware, authorize } from '../../middlewares/token.middleware';

const router = express.Router();

router.post('/register', authController.registerController);

router.post('/verify-email/:token', authController.verifyEmailController);

router.post('/resend-verification-email/:email', authController.resendVerificationEmailController);

router.post('/login', authController.loginController);

router.get('/verify-auth', refreshToken, tokenMiddleware, authController.verifyAuthController);

router.post('/logout', refreshToken, tokenMiddleware, authController.logoutController);

router.post('/admin-register', refreshToken, tokenMiddleware, authorize(['ADMIN']), authController.adminRegisterController);

router.post('/register-local-admin', refreshToken, tokenMiddleware, authorize(['ADMIN']), authController.registerLocalAdminController);

router.post('/register-evaluator', refreshToken, tokenMiddleware, authorize(['MUNICIPAL_ADMIN']), authController.registerLocalEvaluatorController);

router.post('/create-password', authController.createPasswordController);

router.patch('/change-password', refreshToken, tokenMiddleware, authController.changePasswordController);

export default router;