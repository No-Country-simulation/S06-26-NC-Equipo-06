import { Request, Response, NextFunction } from 'express';
import * as AuthServices from './auth.users.services';
import { loginSchema, registerSchema, verifyEmailSchema, resendVerificationEmailSchema } from './auth.users.schema';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, ruc, companyName } = registerSchema.parse(req.body);

        const responseService = await AuthServices.registerService(email, password, ruc, companyName);

        res.status(201).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });

    } catch (error) {
        next(error);
    }
}

export const verifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = verifyEmailSchema.parse(req.params);

        const responseService = await AuthServices.verifyEmailService(token);

        res.status(200).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });

    } catch (error) {
        next(error);
    }
}

export const resendVerificationEmailController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = resendVerificationEmailSchema.parse(req.params);

        const responseService = await AuthServices.resendVerificationEmailService(email);

        res.status(200).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });

    } catch (error) {
        next(error);
    }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const responseService = await AuthServices.loginService(email, password);

        res.cookie('refreshToken', responseService.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('token', responseService.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });

    } catch (error) {
        next(error);
    }
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const refreshToken = req.cookies.refreshToken;

        const responseService = await AuthServices.logoutService(refreshToken);

        res.clearCookie('refreshToken');
        res.clearCookie('token');

        res.status(200).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });
    } catch (error) {
        next(error);
    }
}

export const verifyAuthController = async (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: 'Usuario autenticado',
        code: 'USER_AUTHENTICATED'
    });
}