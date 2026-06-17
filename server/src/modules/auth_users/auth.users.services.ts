import { validatePassword } from '../../utils/validate.password';
import { prisma } from '../../config/prisma';
import { generateRefreshToken } from '../../utils/generate.refresh.token';
import { generateToken, generateRefreshTokenJwt, generateEmailVerificationToken } from '../../utils/generate.token';
import { hashPassword } from '../../utils/hash.password';
import { sendEmail } from '../../config/nodemailer';
import { validateEmailVerificationToken, validateRefreshToken } from "../../utils/validate.token";
import { hashRefreshToken } from '../../utils/hash.refresh.token';
import { AppError } from '../../utils/app.error';

export const registerService = async (email: string, password: string, ruc: string, companyName: string) => {

    const findCompany = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (findCompany) {
        throw new AppError(409, 'Email ya registrado', 'EMAIL_ALREADY_EXISTS');
    }

    const findRuc = await prisma.companyProfile.findUnique({
        where: {
            ruc
        }
    });

    if (findRuc) {
        throw new AppError(409, 'El RUC ya está registrado', 'RUC_ALREADY_EXISTS');
    }

    const hashPasswordUser = await hashPassword(password);

    const newUser = await prisma.user.create({
        data: {
            email,
            passwordHash: hashPasswordUser,
            role: 'COMPANY'
        }
    });

    await prisma.companyProfile.create({
        data: {
            userId: newUser.id,
            ruc,
            companyName
        }
    });

    const emailVerificationToken = generateEmailVerificationToken({ id: newUser.id, email: newUser.email });

    await sendEmail({
        to: newUser.email,
        subject: 'Verificacion de correo electronico',
        html: `<p>Se ha enviado un enlace de verificación de correo electrónico. Por favor, verifique su correo electrónico haciendo clic en el siguiente enlace:</p><a href="${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}">Verificar correo electrónico</a>`
    });

    return {
        message: "Empresa registrada exitosamente, por favor verifica tu email para activar tu cuenta",
        code: "COMPANY_REGISTRATION_COMPLETED"
    };

}

export const verifyEmailService = async (token: string) => {

    const decode = validateEmailVerificationToken(token);

    if (!decode) {
        throw new AppError(400, "Token de verificacion no valido", 'INVALID_TOKEN');
    }

    const findUser = await prisma.user.findUnique({
        where: {
            id: decode.id
        }
    });

    if (!findUser) {
        throw new AppError(404, "El usuario no existe", 'USER_NOT_FOUND');
    }

    if (findUser.isActive) {
        throw new AppError(409, "El usuario ya ha sido verificado", 'EMAIL_ALREADY_VERIFIED');
    }

    await prisma.user.update({
        where: {
            id: decode.id
        },
        data: {
            isActive: true
        }
    });

    await sendEmail({
        to: findUser.email,
        subject: 'Verificacion de correo electronico exitosa',
        html: `<p>Se ha verificado exitosamente tu correo electronico</p><br><a href="${process.env.FRONTEND_URL}/login">Ir a iniciar Sesión</a>`
    });

    return {
        message: "Email verificado exitosamente",
        code: "EMAIL_VERIFICATION_COMPLETED"
    };

}

export const resendVerificationEmailService = async (email: string) => {

    const findUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!findUser) {
        throw new AppError(404, "El usuario no existe", 'USER_NOT_FOUND');
    }

    if (findUser.isActive) {
        throw new AppError(409, "El usuario ya ha sido verificado", 'EMAIL_ALREADY_VERIFIED');
    }

    const emailVerificationToken = generateEmailVerificationToken({ id: findUser.id, email: findUser.email });

    await sendEmail({
        to: findUser.email,
        subject: 'Verificacion de correo electronico',
        html: `<p>Se ha enviado un nuevo enlace de verificación de correo electrónico. Por favor, verifique su correo electrónico haciendo clic en el siguiente enlace:</p><a href="${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}">Verificar correo electrónico</a>`
    });

    return {
        message: "Se ha enviado un nuevo enlace de verificación de correo electrónico",
        code: "EMAIL_VERIFICATION_RESENT"
    };

}

export const loginService = async (email: string, password: string) => {

    const foundCompany = await prisma.user.findUnique({
        where: {
            email,
            role: "COMPANY"
        }
    });

    if (!foundCompany) {
        throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    if (foundCompany.isActive === false) {
        throw new AppError(403, 'Su cuenta no esta activada', 'ACCOUNT_NOT_ACTIVE');
    }

    const isValidPassword = await validatePassword(password, foundCompany.passwordHash);

    if (!isValidPassword) {
        throw new AppError(401, 'Contraseña incorrecta', 'INVALID_PASSWORD');
    }

    const { refreshToken, hashed } = generateRefreshToken();

    const session = await prisma.session.create({
        data: {
            refreshToken: hashed,
            userId: foundCompany.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revoked: false,
        }
    }
    );

    const refreshTokenJwt = generateRefreshTokenJwt({ id: foundCompany.id, refreshTokenId: session.id, refreshToken: refreshToken });

    const token = generateToken({ id: foundCompany.id, email: foundCompany.email, role: foundCompany.role });

    return {
        token,
        refreshToken: refreshTokenJwt,
        message: "Inicio de sesión exitoso",
        code: "LOGIN_COMPLETED"
    };

}

export const logoutService = async (refreshToken: string) => {

    const decode = validateRefreshToken(refreshToken);

    if (!decode) {
        throw new AppError(401, "Token no valido", 'INVALID_TOKEN');
    }

    const hashToken = hashRefreshToken(decode.refreshToken);

    const foundSession = await prisma.session.findUnique({
        where: {
            id: decode.refreshTokenId,
            userId: decode.id,
            refreshToken: hashToken,
            revoked: false
        }
    });

    if (!foundSession) {
        throw new AppError(404, "Sesión no encontrada", 'SESSION_NOT_FOUND');
    }

    await prisma.session.update({
        where: {
            refreshToken: hashToken
        },
        data: {
            revoked: true
        }
    });

    return {
        message: "Logout exitoso",
        code: "LOGOUT_COMPLETED"
    };

}