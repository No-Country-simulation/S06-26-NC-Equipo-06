import { Request, Response, NextFunction } from 'express';
import * as tenderServices from './tenders.services';
import {
    createTenderSchema,
    updateTenderSchema,
    idSchema
} from './tenders.schema';
import { AppError } from '../../utils/app.error';

export const createTenderController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = (req as any).user;

        const data = createTenderSchema.parse(req.body);

        const files = (req.files as { [fieldname: string]: Express.Multer.File[] })?.documents ?? [];

        if (!files || files.length === 0) {
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

export const updateTenderController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = (req as any).user;

        const data = updateTenderSchema.parse(req.body);

        const { id } = idSchema.parse(req.params);

        const response = await tenderServices.updateTenderService(data, user.userId, id);

        res.status(201).json({
            success: true,
            message: response.message,
            code: response.code
        });

    } catch (error) {
        next(error);
    }
}

export const deleteTenderFileController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = (req as any).user;

        const { id } = idSchema.parse(req.params);

        const response = await tenderServices.deleteTenderFileService(user.userId, id);

        res.status(201).json({
            success: true,
            message: response.message,
            code: response.code
        });

    } catch (error) {
        next(error);
    }
}

export const addTenderFileController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = (req as any).user;

        const { id } = idSchema.parse(req.params);

        const file = (req.file as Express.Multer.File);

        if (!file) {
            throw new AppError(400, "No se ha subido ningun archivo", 'NO_FILE_UPLOADED');
        }

        const response = await tenderServices.addTenderFileService(id, user.userId, file);

        res.status(201).json({
            success: true,
            message: response.message,
            code: response.code
        });

    } catch (error) {
        next(error);
    }
}