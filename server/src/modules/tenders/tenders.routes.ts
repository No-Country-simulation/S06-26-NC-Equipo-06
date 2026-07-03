import express from 'express';
import * as tendersController from './tenders.controller';
import { refreshToken } from '../../middlewares/refresh.token.middleware';
import { tokenMiddleware, authorize } from '../../middlewares/token.middleware';
import upload from '../../config/multer';

const router = express.Router();

router.post('/create-tender', refreshToken, tokenMiddleware, authorize(['MUNICIPAL_EVALUATOR']), upload.fields([{ name: 'documents', maxCount: 10 }]), tendersController.createTenderController);

router.put('/update-tender/:id', refreshToken, tokenMiddleware, authorize(['MUNICIPAL_EVALUATOR']), upload.fields([{ name: 'documents', maxCount: 10 }]), tendersController.updateTenderController);

router.delete('/delete-file-tender/:id', refreshToken, tokenMiddleware, authorize(['MUNICIPAL_EVALUATOR']), tendersController.deleteTenderFileController);

router.post('/add-file-tender/:id', refreshToken, tokenMiddleware, authorize(['MUNICIPAL_EVALUATOR']), upload.single('documents'), tendersController.addTenderFileController);

router.patch('/delete-tender/:id', refreshToken, tokenMiddleware, authorize(['MUNICIPAL_EVALUATOR']), tendersController.deleteTenderController);

export default router;