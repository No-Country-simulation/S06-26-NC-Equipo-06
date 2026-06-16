import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app.error';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            code: err.code,
            details: err.details,
        });
    }

    console.error('Error no controlado:', err);

    return res.status(500).json({
        success: false,
        message: 'Ocurrió un error interno en el servidor',
        code: 'INTERNAL_SERVER_ERROR'
    });
};