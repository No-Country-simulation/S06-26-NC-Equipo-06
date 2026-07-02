import { Request, Response, NextFunction } from 'express';
import * as AuthServices from './auth.users.services';
import {
    loginSchema,
    registerSchema,
    verifyEmailSchema,
    resendVerificationEmailSchema,
    adminRegisterSchema,
    registerLocalAdminSchema,
    registerLocalEvaluatorSchema,
    tokenSchema,
    passwordSchema,
    changePasswordSchema,
    recoverPasswordSchema,
    newPasswordSchema
} from './auth.users.schema';

const getAuditMeta = (req: Request) => ({
    ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0] ?? req.ip ?? null,
    userAgent: req.get('user-agent') ?? null
});

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, ruc, companyName, taxStatus, fiscalAddress, fiscalStatus } = registerSchema.parse(req.body);

        const responseService = await AuthServices.registerService(email, password, ruc, companyName, getAuditMeta(req));
        const responseService = await AuthServices.registerService(email, password, ruc, companyName, taxStatus, fiscalAddress, fiscalStatus);

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

        const responseService = await AuthServices.verifyEmailService(token, getAuditMeta(req));

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

        const responseService = await AuthServices.resendVerificationEmailService(email, getAuditMeta(req));

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

        const responseService = await AuthServices.loginService(email, password, getAuditMeta(req));

        res.cookie('refreshToken', responseService.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('token', responseService.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: responseService.message,
            code: responseService.code,
            role: responseService.role,
            data: {
                name: responseService.data.name,
                ruc: responseService.data.ruc
            }
        });

    } catch (error) {
        next(error);
    }
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const refreshToken = req.cookies.refreshToken;

        const responseService = await AuthServices.logoutService(refreshToken, getAuditMeta(req));

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

export const verifyAuthController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        res.status(200).json({
            success: true,
            message: 'Usuario autenticado',
            code: 'USER_AUTHENTICATED',
            role: user.role
        });
    } catch (error) {
        next(error);
    }
}

export const adminRegisterController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = (req as any).user;

        const { email, firstName, lastName } = adminRegisterSchema.parse(req.body);

        const responseService = await AuthServices.adminRegisterService(email, firstName, lastName, {
            actorId: user?.userId ?? null,
            actorRole: user?.role ?? null
        }, getAuditMeta(req));

        res.status(201).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });

    } catch (error) {
        next(error);
    }
}

export const registerLocalAdminController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const user = (req as any).user;

        const { email, firstName, lastName, municipality } = registerLocalAdminSchema.parse(req.body);

        const responseService = await AuthServices.registerLocalAdminService(email, firstName, lastName, municipality, {
            actorId: user?.userId ?? null,
            actorRole: user?.role ?? null
        }, getAuditMeta(req));

        res.status(201).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });

    } catch (error) {
        next(error);
    }
}

export const registerLocalEvaluatorController = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    try {
        const { email, firstName, lastName } = registerLocalEvaluatorSchema.parse(req.body);

        const responseService = await AuthServices.registerLocalEvaluatorService(email, firstName, lastName, user.userId, getAuditMeta(req));

        res.status(201).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });

    } catch (error) {
        next(error);
    }
}

export const createPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { token } = tokenSchema.parse(req.query);
        const { password } = passwordSchema.parse(req.body);

        const responseService = await AuthServices.createPasswordService(token, password, getAuditMeta(req));

        res.status(201).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });

    } catch (error) {
        next(error);
    }
}

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { password, oldPassword } = changePasswordSchema.parse(req.body);

        const user = (req as any).user;

        const responseService = await AuthServices.changePasswordService(password, oldPassword, user.userId, getAuditMeta(req));

        res.status(201).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });

    } catch (error) {
        next(error);
    }
}

export const recoverPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { email } = recoverPasswordSchema.parse(req.body);

        const responseService = await AuthServices.recoverPasswordService(email, getAuditMeta(req));

        res.status(201).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });

    } catch (error) {
        next(error);
    }
}

export const newPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { token } = tokenSchema.parse(req.params);
        const { password } = newPasswordSchema.parse(req.body);

        const responseService = await AuthServices.newPasswordService(token, password, getAuditMeta(req));

        res.status(201).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });

    } catch (error) {
        next(error);
    }
}

export const closeSessionUnauthController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { token } = tokenSchema.parse(req.params);

        const responseService = await AuthServices.closeSessionUnauthService(token, getAuditMeta(req));

        res.status(200).json({
            success: true,
            message: responseService.message,
            code: responseService.code
        });
    } catch (error) {
        next(error);
    }
}
