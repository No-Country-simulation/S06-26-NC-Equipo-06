import express from 'express';
import * as userController from './users.controller';
import { refreshToken } from '../../middlewares/refresh.token.middleware';
import { tokenMiddleware } from '../../middlewares/token.middleware';

const router = express.Router();

router.get('/me/profile', refreshToken, tokenMiddleware, userController.getProfileController);

router.patch('/me/profile', refreshToken, tokenMiddleware, userController.updateProfileController);

export default router;