import { validatePassword } from '../../utils/validate.password';
import { prisma } from '../../config/prisma';
import { generateRefreshToken } from '../../utils/generate.refresh.token';
import { generateToken, generateRefreshTokenJwt, generateEmailVerificationToken } from '../../utils/generate.token';
import { hashPassword } from '../../utils/hash.password';
import { sendEmail } from '../../config/nodemailer';
import { validateEmailVerificationToken, validateRefreshToken } from "../../utils/validate.token";
import { hashRefreshToken } from '../../utils/hash.refresh.token';
import { AppError } from '../../utils/app.error';
import { generateSecureToken, hashToken } from '../../utils/generate.secure.token';

interface LoginData {
    companyName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: string;
}

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
            email
        },
        include: {
            companyProfile: true,
            adminProfile: true,
            localAdminProfile: true,
            localEvaluator: true
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

    const data: LoginData = {}

    if(foundCompany.role === 'COMPANY' && foundCompany.companyProfile) {
        data.companyName = foundCompany.companyProfile.companyName;
        data.role = foundCompany.role;
    } else if (foundCompany.role === 'ADMIN') {
        data.firstName = foundCompany.adminProfile?.firstName;
        data.lastName = foundCompany.adminProfile?.lastName;
        data.role = foundCompany.role;
    } else if (foundCompany.role === 'MUNICIPAL_ADMIN') {
        data.firstName = foundCompany.localAdminProfile?.firstName;
        data.lastName = foundCompany.localAdminProfile?.lastName;
        data.role = foundCompany.role;
    }else if (foundCompany.role === 'MUNICIPAL_EVALUATOR') {
        data.firstName = foundCompany.localEvaluator?.firstName;
        data.lastName = foundCompany.localEvaluator?.lastName;
        data.role = foundCompany.role;
    }

    return {
        token,
        refreshToken: refreshTokenJwt,
        message: "Inicio de sesión exitoso",
        code: "LOGIN_COMPLETED",
        data: data
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

export const adminRegisterService = async (email: string, firstName: string, lastName: string) => {

    const findAdmin = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (findAdmin) {
        throw new AppError(409, 'Email ya registrado', 'EMAIL_ALREADY_EXISTS');
    }

    const createdUser = await prisma.user.create({
        data: {
            email,
            passwordHash: "******",
            isActive: false,
            role: 'ADMIN'
        }
    });

    await prisma.adminProfile.create({
        data: {
            userId: createdUser.id,
            firstName,
            lastName
        }
    });

    const secureToken = generateSecureToken();
    const hashSecureToken = hashToken(secureToken);

    await prisma.userInvitation.create({
        data: {
            userId: createdUser.id,
            tokenHash: hashSecureToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }
    });

    await sendEmail({
        to: email,
        subject: 'Invitacion para registrarse',
        html: `<p>Se ha enviado un nuevo enlace de invitacion para registrarse. Por favor, regístrese haciendo clic en el siguiente enlace:</p><a href="${process.env.FRONTEND_URL}/register?token=${secureToken}">Registrarse</a>`
    });

    return {
        message: "Registro de administrador exitoso",
        code: "ADMIN_REGISTER_COMPLETED"
    };

}

export const registerLocalAdminService = async (email: string, firstName: string, lastName: string, municipality: string) => {

    const findAdmin = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (findAdmin) {
        throw new AppError(409, 'Email ya registrado', 'EMAIL_ALREADY_EXISTS');
    }

    const findMunicipality = await prisma.municipality.findFirst({
        where: {
            id: municipality
        }
    });

    if (!findMunicipality) {
        throw new AppError(404, 'Municipio no encontrado', 'MUNICIPALITY_NOT_FOUND');
    }

    const createdUser = await prisma.user.create({
        data: {
            email,
            passwordHash: "******",
            role: 'MUNICIPAL_ADMIN'
        }
    });

    await prisma.localAdminProfile.create({
        data: {
            userId: createdUser.id,
            firstName,
            lastName,
            municipalityId: findMunicipality.id
        }
    });

    const secureToken = generateSecureToken();
    const hashSecureToken = hashToken(secureToken);

    await prisma.userInvitation.create({
        data: {
            userId: createdUser.id,
            tokenHash: hashSecureToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }
    });

    await sendEmail({
        to: email,
        subject: 'Invitacion para registrarse',
        html: `<p>Se ha enviado un nuevo enlace de invitacion para registrarse. Por favor, regístrese haciendo clic en el siguiente enlace:</p><a href="${process.env.FRONTEND_URL}/register?token=${secureToken}">Registrarse</a>`
    });

    return {
        message: "Registro de administrador local exitoso",
        code: "LOCAL_ADMIN_REGISTER_COMPLETED"
    };

}

export const registerLocalEvaluatorService = async (email: string, firstName: string, lastName: string, adminId: string) => {

    const findEvaluator = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (findEvaluator) {
        throw new AppError(409, 'Email ya registrado', 'EMAIL_ALREADY_EXISTS');
    }

    const admin = await prisma.user.findUnique({
        where: {
            id: adminId,
            role: 'MUNICIPAL_ADMIN'
        },
        include: {
            localAdminProfile: {
                include: {
                    municipality: true
                }
            }
        }
    });

    if (!admin || !admin.localAdminProfile) {
        throw new AppError(404, 'Administrador no encontrado', 'ADMIN_NOT_FOUND');
    }

    const createdUser = await prisma.user.create({
        data: {
            email,
            passwordHash: "******",
            role: 'MUNICIPAL_EVALUATOR'
        }
    });

    await prisma.localEvaluator.create({
        data: {
            userId: createdUser.id,
            firstName,
            lastName,
            municipalityId: admin.localAdminProfile.municipalityId
        }
    });

    const secureToken = generateSecureToken();
    const hashSecureToken = hashToken(secureToken);

    await prisma.userInvitation.create({
        data: {
            userId: createdUser.id,
            tokenHash: hashSecureToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }
    });

    await sendEmail({
        to: email,
        subject: 'Invitacion para registrarse',
        html: `<p>Se ha enviado un nuevo enlace de invitacion para registrarse. Por favor, regístrese haciendo clic en el siguiente enlace:</p><a href="${process.env.FRONTEND_URL}/register?token=${secureToken}">Registrarse</a>`
    });

    return {
        message: "Registro de evaluador local exitoso",
        code: "LOCAL_EVALUATOR_REGISTER_COMPLETED"
    };
}

export const createPasswordService = async (token: string, password: string) => {

    const hashTokenValue = hashToken(token);

    const foundInvitation = await prisma.userInvitation.findUnique({
        where: {
            tokenHash: hashTokenValue,
        }
    });

    if (!foundInvitation) {
        throw new AppError(404, "Invitacion no encontrada", 'INVITATION_NOT_FOUND');
    }

    if (foundInvitation.expiresAt < new Date()) {
        throw new AppError(400, "Invitacion expirada", 'INVITATION_EXPIRED');
    }

    if (foundInvitation.usedAt !== null) {
        throw new AppError(400, "Invitacion ya usada", 'INVITATION_USED');
    }

    await prisma.user.update({
        where: {
            id: foundInvitation.userId
        },
        data: {
            passwordHash: await hashPassword(password),
            isActive: true
        }
    });

    await prisma.userInvitation.update({
        where: {
            id: foundInvitation.id
        },
        data: {
            usedAt: new Date()
        }
    });

    return {
        message: "Contraseña creada exitosamente",
        code: "PASSWORD_CREATED_COMPLETED"
    };
}