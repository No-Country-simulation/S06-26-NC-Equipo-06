import { Request, Response, NextFunction } from 'express';
import * as UserServices from './users.services';

export const getProfileController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = (req as any).user;

        const response = await UserServices.getProfileService(user.userId, user.role);

        res.status(200).json({
            success: true,
            message: response.message,
            code: response.code,
            data: response.data
        });

    } catch (error) {
        next(error);
    }
}

export const updateProfileController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;

        const response = await UserServices.updateProfileService(user.userId, user.role, req.body);

        res.status(200).json({
            success: true,
            message: response.message,
            code: response.code
        });
    } catch (error) {
        next(error);
    }
}