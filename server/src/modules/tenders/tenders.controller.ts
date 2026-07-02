import { Request, Response, NextFunction } from 'express';
import * as tenderServices from './tenders.services';
import {
    createTenderSchema
} from './tenders.schema';
import { AppError } from '../../utils/app.error';

export const createTenderController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = (req as any).user;

        const data = createTenderSchema.parse(req.body);

        const files = (req.files as { [fieldname: string]: Express.Multer.File[] })?.documents ?? [];

        if(!files || files.length === 0) {
            throw new AppError(400, "No se han subido archivos", 'NO_FILES_UPLOADED');
        }

        const response = await tenderServices.createTenderService(data, user.userId, files);

        res.status(201).json({
            success: true,
            message: response.message,
            code: response.code
        });

    } catch (error) {
        next(error);
    }
}

