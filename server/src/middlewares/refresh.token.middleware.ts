import { validateRefreshToken } from "../utils/validate.token";
import { prisma } from "../config/prisma";
import { hashRefreshToken } from "../utils/hash.refresh.token";
import { AppError } from '../utils/app.error';
import { Request, Response, NextFunction } from 'express';

export const refreshToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(401, 'No estás autorizado (falta refreshToken)', 'TOKEN_INVALID');
    }

    try {

        const decode = validateRefreshToken(refreshToken);

        if (!decode) {
            throw new AppError(401, 'Refresh token inválido', 'TOKEN_INVALID');
        }

        const refreshTokenHash = hashRefreshToken(decode.refreshToken);

        const session = await prisma.session.findUnique({

            where: {
                id: decode.refreshTokenId,
                refreshToken: refreshTokenHash,
                revoked: false,
            }

        })

        if (!session) {
            throw new AppError(401, 'Sesión inválida o expirada by refresh token', 'TOKEN_INVALID');
        }

        if (new Date(session.expiresAt) < new Date()) {
            await prisma.session.delete({ where: { id: session.id } })
            throw new AppError(401, 'Sesión inválida o expirada by refresh token', 'TOKEN_INVALID');
        }

        const user = await prisma.user.findFirst({
            where: { id: decode.id }
        });

        if (!user) {
            throw new AppError(404, 'Usuario no encontrado by refresh token', 'USER_NOT_FOUND');
        }

        if (user.id !== decode.id) {
            throw new AppError(401, 'Usuario no autorizado by refresh token', 'TOKEN_INVALID');
        }

        next();

    } catch (error) {
        next(error);
    }

}