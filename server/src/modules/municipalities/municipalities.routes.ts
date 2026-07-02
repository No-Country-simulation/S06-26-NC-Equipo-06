import express from 'express';
import * as MunicipalityController from './municipalities.controller';
import { refreshToken } from '../../middlewares/refresh.token.middleware';
import { tokenMiddleware,authorize } from '../../middlewares/token.middleware';

const router = express.Router();

router.get('/', refreshToken, tokenMiddleware, authorize(['ADMIN']), MunicipalityController.getMunicipalitiesController);
router.get('/:id', refreshToken, tokenMiddleware, authorize(['ADMIN']), MunicipalityController.getMunicipalityByIdController);
router.post('/', refreshToken, tokenMiddleware, authorize(['ADMIN']), MunicipalityController.createMunicipalityController);
router.patch('/:id', refreshToken, tokenMiddleware, authorize(['ADMIN']), MunicipalityController.updateMunicipalityController);
router.get('/validate/:id', refreshToken, tokenMiddleware, authorize(['ADMIN']), MunicipalityController.validateMunicipalityController);

export default router;
