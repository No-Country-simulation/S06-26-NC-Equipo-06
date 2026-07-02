import express from 'express';
import * as tendersController from './tenders.controller';
import { refreshToken } from '../../middlewares/refresh.token.middleware';
import { tokenMiddleware, authorize } from '../../middlewares/token.middleware';
import upload from '../../config/multer';

const router = express.Router();

router.use('/create-tender', refreshToken, tokenMiddleware, authorize(['MUNICIPAL_EVALUATOR']), upload.fields([{ name: 'documents', maxCount: 10 }]), tendersController.createTenderController);

export default router;