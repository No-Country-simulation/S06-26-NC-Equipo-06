import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { validateToken } from '../utils/validate.token'
import { prisma } from '../config/prisma';
import { AppError } from '../utils/app.error';

export const tokenMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {

    const token = req.cookies.token;

    if (!token) {
        throw new AppError(401, 'No estás autorizado (falta token)', 'TOKEN_INVALID');
    }

    try {
        const decoded = validateToken(token) as any;

        if (!decoded) {
            throw new AppError(401, 'Token inválido', 'TOKEN_INVALID');
        }

        const user = await prisma.user.findFirst({ where: { id: decoded.id } });

        if (!user) {
            throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
        }

        if (user.isActive === false) {
            throw new AppError(401, 'Usuario deshabilitado', 'USER_DISABLED');
        }

        (req as any).user = { userId: user.id, role: user.role, email: user.email };

        return next();

    } catch (error) {
        next(error);
    }
};

export const authorize = (roles: Role[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const user = (req as any).user;

        if (!user || !roles.includes(user.role)) {
            throw new AppError(403, 'No tienes permisos para realizar esta acción', 'ROLE_INVALID');
        }

        return next();
    };
};
