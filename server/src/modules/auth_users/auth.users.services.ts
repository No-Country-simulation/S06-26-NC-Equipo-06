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
import { Actors, Role, Status, TargetType } from '@prisma/client';
import { createAuditLog } from '../audit/audit.service';
import { AUDIT_ACTIONS, AUDIT_ERROR_CODES } from '../audit/audit.constants';

type AuditRequestMeta = {
    ipAddress?: string | null;
    userAgent?: string | null;
};

type AuditActorContext = {
    actorId?: string | null;
    actorRole?: Role | null;
};

export const registerService = async (email: string, password: string, ruc: string, companyName: string, auditMeta: AuditRequestMeta = {}) => {
export const registerService = async (email: string, password: string, ruc: string, companyName: string, taxStatus: string, fiscalAddress: string, fiscalStatus: boolean) => {

    const findCompany = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (findCompany) {
        await createAuditLog({
            action: AUDIT_ACTIONS.COMPANY_REGISTER_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.USER,
            targetId: findCompany.id,
            errorCode: AUDIT_ERROR_CODES.EMAIL_ALREADY_EXISTS,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email,
            },
        });

        throw new AppError(409, 'Email ya registrado', 'EMAIL_ALREADY_EXISTS');
    }

    const findRuc = await prisma.companyProfile.findUnique({
        where: {
            ruc
        }
    });

    if (findRuc) {
        await createAuditLog({
            action: AUDIT_ACTIONS.COMPANY_REGISTER_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.COMPANY_PROFILE,
            targetId: findRuc.id,
            errorCode: AUDIT_ERROR_CODES.RUC_ALREADY_EXISTS,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email,
                ruc,
                companyName,
            },
        });

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
            companyName,
            taxStatus: taxStatus as 'HABIDO' | 'NO_HABIDO' | 'NO_HALLADO',
            fiscalAddress,
            fiscalStatus
        }
    });

    await createAuditLog({
        action: AUDIT_ACTIONS.COMPANY_REGISTERED,
        status: Status.SUCCESS,
        actorType: Actors.ANONYMOUS,
        actorId: null,
        actorRole: null,
        targetType: TargetType.USER,
        targetId: newUser.id,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
        additionalData: {
            email: newUser.email,
            ruc,
            companyName,
        },
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

export const verifyEmailService = async (token: string, auditMeta: AuditRequestMeta = {}) => {

    const decode = validateEmailVerificationToken(token);

    if (!decode) {
        await createAuditLog({
            action: AUDIT_ACTIONS.EMAIL_VERIFICATION_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: null,
            targetId: null,
            errorCode: AUDIT_ERROR_CODES.INVALID_TOKEN,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
        });

        throw new AppError(400, "Token de verificacion no valido", 'INVALID_TOKEN');
    }

    const findUser = await prisma.user.findUnique({
        where: {
            id: decode.id
        }
    });

    if (!findUser) {
        await createAuditLog({
            action: AUDIT_ACTIONS.EMAIL_VERIFICATION_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: null,
            targetId: null,
            errorCode: AUDIT_ERROR_CODES.USER_NOT_FOUND,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
        });

        throw new AppError(404, "El usuario no existe", 'USER_NOT_FOUND');
    }

    if (findUser.isActive) {
        await createAuditLog({
            action: AUDIT_ACTIONS.EMAIL_VERIFICATION_FAILED,
            status: Status.FAILED,
            actorType: Actors.USER,
            actorId: findUser.id,
            actorRole: findUser.role,
            targetType: TargetType.USER,
            targetId: findUser.id,
            errorCode: 'EMAIL_ALREADY_VERIFIED',
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email: findUser.email,
            },
        });

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

    await createAuditLog({
        action: AUDIT_ACTIONS.EMAIL_VERIFIED,
        status: Status.SUCCESS,
        actorType: Actors.USER,
        actorId: findUser.id,
        actorRole: findUser.role,
        targetType: TargetType.USER,
        targetId: findUser.id,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
        additionalData: {
            email: findUser.email,
        },
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

export const resendVerificationEmailService = async (email: string, auditMeta: AuditRequestMeta = {}) => {

    const findUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!findUser) {
        await createAuditLog({
            action: AUDIT_ACTIONS.VERIFICATION_EMAIL_RESEND_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: null,
            targetId: null,
            errorCode: AUDIT_ERROR_CODES.USER_NOT_FOUND,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email,
            },
        });

        throw new AppError(404, "El usuario no existe", 'USER_NOT_FOUND');
    }

    if (findUser.isActive) {
        await createAuditLog({
            action: AUDIT_ACTIONS.VERIFICATION_EMAIL_RESEND_FAILED,
            status: Status.FAILED,
            actorType: Actors.USER,
            actorId: findUser.id,
            actorRole: findUser.role,
            targetType: TargetType.USER,
            targetId: findUser.id,
            errorCode: 'EMAIL_ALREADY_VERIFIED',
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email: findUser.email,
            },
        });

        throw new AppError(409, "El usuario ya ha sido verificado", 'EMAIL_ALREADY_VERIFIED');
    }

    const emailVerificationToken = generateEmailVerificationToken({ id: findUser.id, email: findUser.email });

    await sendEmail({
        to: findUser.email,
        subject: 'Verificacion de correo electronico',
        html: `<p>Se ha enviado un nuevo enlace de verificación de correo electrónico. Por favor, verifique su correo electrónico haciendo clic en el siguiente enlace:</p><a href="${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}">Verificar correo electrónico</a>`
    });

    await createAuditLog({
        action: AUDIT_ACTIONS.VERIFICATION_EMAIL_RESENT,
        status: Status.SUCCESS,
        actorType: Actors.USER,
        actorId: findUser.id,
        actorRole: findUser.role,
        targetType: TargetType.USER,
        targetId: findUser.id,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
        additionalData: {
            email: findUser.email,
        },
    });

    return {
        message: "Se ha enviado un nuevo enlace de verificación de correo electrónico",
        code: "EMAIL_VERIFICATION_RESENT"
    };

}

export const loginService = async (email: string, password: string, auditMeta: AuditRequestMeta = {}) => {

    const foundCompany = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!foundCompany) {
        await createAuditLog({
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: null,
            targetId: null,
            errorCode: AUDIT_ERROR_CODES.USER_NOT_FOUND,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email,
            },
        });

        throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    if (foundCompany.isActive === false) {
        await createAuditLog({
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.USER,
            targetId: foundCompany.id,
            errorCode: AUDIT_ERROR_CODES.ACCOUNT_NOT_ACTIVE,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email,
            },
        });

        throw new AppError(403, 'Su cuenta no esta activada', 'ACCOUNT_NOT_ACTIVE');
    }

    const isValidPassword = await validatePassword(password, foundCompany.passwordHash);

    if (!isValidPassword) {
        await createAuditLog({
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.USER,
            targetId: foundCompany.id,
            errorCode: AUDIT_ERROR_CODES.INVALID_PASSWORD,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email,
            },
        });

        throw new AppError(401, 'Contraseña incorrecta', 'INVALID_PASSWORD');
    }

    const profile: {
        name: string | null;
        ruc: string | null;
    } = {
        name: null,
        ruc: null,
    };

    if(foundCompany.role === 'COMPANY') {
        let find = await prisma.companyProfile.findUnique({
            where: {
                userId: foundCompany.id
            }
        });

        if (!find) {
            throw new AppError(404, 'Perfil de empresa no encontrado', 'COMPANY_PROFILE_NOT_FOUND');
        }

        profile.name = find?.companyName;
        profile.ruc = find?.ruc;

    } else if(foundCompany.role === 'ADMIN') {
        let find = await prisma.adminProfile.findUnique({
            where: {
                userId: foundCompany.id
            }
        });

        if (!find) {
            throw new AppError(404, 'Perfil de administrador no encontrado', 'ADMIN_PROFILE_NOT_FOUND');
        }

        profile.name = find?.firstName + ' ' + find?.lastName;
        profile.ruc = null;
    } else if(foundCompany.role === 'MUNICIPAL_ADMIN') {
        let find = await prisma.localAdminProfile.findUnique({
            where: {
                userId: foundCompany.id
            }
        });

        if (!find) {
            throw new AppError(404, 'Perfil de administrador local no encontrado', 'LOCAL_ADMIN_PROFILE_NOT_FOUND');
        }

        profile.name = `${find.firstName} ${find.lastName}`;
        profile.ruc = null;

    } else if(foundCompany.role === 'MUNICIPAL_EVALUATOR') {
        let find = await prisma.localEvaluator.findUnique({
            where: {
                userId: foundCompany.id
            }
        });

        if (!find) {
            throw new AppError(404, 'Perfil de evaluador local no encontrado', 'LOCAL_EVALUATOR_PROFILE_NOT_FOUND');
        }

        profile.name = `${find.firstName} ${find.lastName}`;
        profile.ruc = null;
    } else {
        throw new AppError(500, 'Rol de usuario no reconocido', 'UNRECOGNIZED_USER_ROLE');
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

    await createAuditLog({
        action: AUDIT_ACTIONS.LOGIN_SUCCESS,
        status: Status.SUCCESS,
        actorType: Actors.USER,
        actorId: foundCompany.id,
        actorRole: foundCompany.role,
        targetType: TargetType.AUTH_SESSION,
        targetId: session.id,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
        additionalData: {
            email: foundCompany.email,
        },
    });

    const refreshTokenJwt = generateRefreshTokenJwt({ id: foundCompany.id, refreshTokenId: session.id, refreshToken: refreshToken });

    const token = generateToken({ id: foundCompany.id, email: foundCompany.email, role: foundCompany.role });

    await sendEmail({
        to: foundCompany.email,
        subject: 'Inicio de sesión exitoso',
        html: `<p>Se ha iniciado sesión exitosamente en su cuenta. Si usted no ha realizado este cambio, por favor, pongase en contacto con soporte.</p>`
    });

    return {
        token,
        refreshToken: refreshTokenJwt,
        message: "Inicio de sesión exitoso",
        code: "LOGIN_COMPLETED",
        role: foundCompany.role,
        data: {
            name: profile.name || null,
            ruc: profile.ruc || null,
        }
    };

}

export const logoutService = async (refreshToken: string, auditMeta: AuditRequestMeta = {}) => {

    const decode = validateRefreshToken(refreshToken);

    if (!decode) {
        await createAuditLog({
            action: AUDIT_ACTIONS.LOGOUT_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: null,
            targetId: null,
            errorCode: AUDIT_ERROR_CODES.INVALID_TOKEN,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
        });

        throw new AppError(401, "Token no valido", 'INVALID_TOKEN');
    }

    const hashToken = hashRefreshToken(decode.refreshToken);

    const foundSession = await prisma.session.findUnique({
        where: {
            id: decode.refreshTokenId,
            userId: decode.id,
            refreshToken: hashToken,
            revoked: false
        },
        include: {
            user: true
        }
    });

    if (!foundSession) {
        await createAuditLog({
            action: AUDIT_ACTIONS.LOGOUT_FAILED,
            status: Status.FAILED,
            actorType: Actors.USER,
            actorId: decode.id,
            actorRole: null,
            targetType: TargetType.AUTH_SESSION,
            targetId: decode.refreshTokenId,
            errorCode: AUDIT_ERROR_CODES.SESSION_NOT_FOUND,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
        });

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

    await createAuditLog({
        action: AUDIT_ACTIONS.LOGOUT_SUCCESS,
        status: Status.SUCCESS,
        actorType: Actors.USER,
        actorId: decode.id,
        actorRole: foundSession.user.role,
        targetType: TargetType.AUTH_SESSION,
        targetId: foundSession.id,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
    });

    return {
        message: "Logout exitoso",
        code: "LOGOUT_COMPLETED"
    };

}

export const adminRegisterService = async (email: string, firstName: string, lastName: string, auditActor: AuditActorContext = {}, auditMeta: AuditRequestMeta = {}) => {

    const findAdmin = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (findAdmin) {
        await createAuditLog({
            action: AUDIT_ACTIONS.ADMIN_INVITE_FAILED,
            status: Status.FAILED,
            actorType: auditActor.actorId ? Actors.USER : Actors.SYSTEM,
            actorId: auditActor.actorId ?? null,
            actorRole: auditActor.actorRole ?? null,
            targetType: TargetType.USER,
            targetId: findAdmin.id,
            errorCode: AUDIT_ERROR_CODES.EMAIL_ALREADY_EXISTS,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email,
                firstName,
                lastName,
            },
        });

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

    const createdInvitation = await prisma.userInvitation.create({
        data: {
            userId: createdUser.id,
            tokenHash: hashSecureToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }
    });

    await createAuditLog({
        action: AUDIT_ACTIONS.ADMIN_INVITED,
        status: Status.SUCCESS,
        actorType: auditActor.actorId ? Actors.USER : Actors.SYSTEM,
        actorId: auditActor.actorId ?? null,
        actorRole: auditActor.actorRole ?? null,
        targetType: TargetType.USER_INVITATION,
        targetId: createdInvitation.id,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
        additionalData: {
            invitedUserId: createdUser.id,
            email: createdUser.email,
            role: createdUser.role,
            firstName,
            lastName,
        },
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

export const registerLocalAdminService = async (email: string, firstName: string, lastName: string, municipality: string, auditActor: AuditActorContext = {}, auditMeta: AuditRequestMeta = {}) => {

    const findAdmin = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (findAdmin) {
        await createAuditLog({
            action: AUDIT_ACTIONS.LOCAL_ADMIN_INVITE_FAILED,
            status: Status.FAILED,
            actorType: auditActor.actorId ? Actors.USER : Actors.SYSTEM,
            actorId: auditActor.actorId ?? null,
            actorRole: auditActor.actorRole ?? null,
            targetType: TargetType.USER,
            targetId: findAdmin.id,
            errorCode: AUDIT_ERROR_CODES.EMAIL_ALREADY_EXISTS,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email,
                firstName,
                lastName,
                municipality,
            },
        });

        throw new AppError(409, 'Email ya registrado', 'EMAIL_ALREADY_EXISTS');
    }

    const findMunicipality = await prisma.municipality.findFirst({
        where: {
            id: municipality
        }
    });

    if (!findMunicipality) {
        await createAuditLog({
            action: AUDIT_ACTIONS.LOCAL_ADMIN_INVITE_FAILED,
            status: Status.FAILED,
            actorType: auditActor.actorId ? Actors.USER : Actors.SYSTEM,
            actorId: auditActor.actorId ?? null,
            actorRole: auditActor.actorRole ?? null,
            targetType: TargetType.MUNICIPALITY,
            targetId: municipality,
            errorCode: AUDIT_ERROR_CODES.MUNICIPALITY_NOT_FOUND,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email,
                firstName,
                lastName,
            },
        });

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

    const createdInvitation = await prisma.userInvitation.create({
        data: {
            userId: createdUser.id,
            tokenHash: hashSecureToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }
    });

    await createAuditLog({
        action: AUDIT_ACTIONS.LOCAL_ADMIN_INVITED,
        status: Status.SUCCESS,
        actorType: auditActor.actorId ? Actors.USER : Actors.SYSTEM,
        actorId: auditActor.actorId ?? null,
        actorRole: auditActor.actorRole ?? null,
        municipalityId: findMunicipality.id,
        targetType: TargetType.USER_INVITATION,
        targetId: createdInvitation.id,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
        additionalData: {
            invitedUserId: createdUser.id,
            email: createdUser.email,
            role: createdUser.role,
            firstName,
            lastName,
        },
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

export const registerLocalEvaluatorService = async (email: string, firstName: string, lastName: string, adminId: string, auditMeta: AuditRequestMeta = {}) => {

    const findEvaluator = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (findEvaluator) {
        await createAuditLog({
            action: AUDIT_ACTIONS.LOCAL_EVALUATOR_INVITE_FAILED,
            status: Status.FAILED,
            actorType: Actors.USER,
            actorId: adminId,
            actorRole: null,
            targetType: TargetType.USER,
            targetId: findEvaluator.id,
            errorCode: AUDIT_ERROR_CODES.EMAIL_ALREADY_EXISTS,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email,
                firstName,
                lastName,
            },
        });

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
        await createAuditLog({
            action: AUDIT_ACTIONS.LOCAL_EVALUATOR_INVITE_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: null,
            targetId: null,
            errorCode: AUDIT_ERROR_CODES.ADMIN_NOT_FOUND,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                adminId,
                email,
                firstName,
                lastName,
            },
        });

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

    const createdInvitation = await prisma.userInvitation.create({
        data: {
            userId: createdUser.id,
            tokenHash: hashSecureToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }
    });

    await createAuditLog({
        action: AUDIT_ACTIONS.LOCAL_EVALUATOR_INVITED,
        status: Status.SUCCESS,
        actorType: Actors.USER,
        actorId: admin.id,
        actorRole: admin.role,
        municipalityId: admin.localAdminProfile.municipalityId,
        targetType: TargetType.USER_INVITATION,
        targetId: createdInvitation.id,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
        additionalData: {
            invitedUserId: createdUser.id,
            email: createdUser.email,
            role: createdUser.role,
            firstName,
            lastName,
        },
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

export const createPasswordService = async (token: string, password: string, auditMeta: AuditRequestMeta = {}) => {

    const hashTokenValue = hashToken(token);

    const foundInvitation = await prisma.userInvitation.findUnique({
        where: {
            tokenHash: hashTokenValue,
        },
        include: {
            user: true
        }
    });

    if (!foundInvitation) {
        await createAuditLog({
            action: AUDIT_ACTIONS.INVITATION_PASSWORD_CREATION_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.USER_INVITATION,
            targetId: null,
            errorCode: AUDIT_ERROR_CODES.INVITATION_NOT_FOUND,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
        });

        throw new AppError(404, "Invitacion no encontrada", 'INVITATION_NOT_FOUND');
    }

    if (foundInvitation.expiresAt < new Date()) {
        await createAuditLog({
            action: AUDIT_ACTIONS.INVITATION_PASSWORD_CREATION_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.USER_INVITATION,
            targetId: foundInvitation.id,
            errorCode: AUDIT_ERROR_CODES.INVITATION_EXPIRED,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                userId: foundInvitation.userId,
            },
        });

        throw new AppError(400, "Invitacion expirada", 'INVITATION_EXPIRED');
    }

    if (foundInvitation.usedAt !== null) {
        await createAuditLog({
            action: AUDIT_ACTIONS.INVITATION_PASSWORD_CREATION_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.USER_INVITATION,
            targetId: foundInvitation.id,
            errorCode: AUDIT_ERROR_CODES.INVITATION_USED,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                userId: foundInvitation.userId,
            },
        });

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

    await createAuditLog({
        action: AUDIT_ACTIONS.INVITATION_PASSWORD_CREATED,
        status: Status.SUCCESS,
        actorType: Actors.USER,
        actorId: foundInvitation.userId,
        actorRole: foundInvitation.user.role,
        targetType: TargetType.USER,
        targetId: foundInvitation.userId,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
        additionalData: {
            invitationId: foundInvitation.id,
            email: foundInvitation.user.email,
        },
    });

    return {
        message: "Contraseña creada exitosamente",
        code: "PASSWORD_CREATED_COMPLETED"
    };
}

export const changePasswordService = async (password: string, oldPassword: string, userId: string, auditMeta: AuditRequestMeta = {}) => {

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        await createAuditLog({
            action: AUDIT_ACTIONS.PASSWORD_CHANGE_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.USER,
            targetId: userId,
            errorCode: AUDIT_ERROR_CODES.USER_NOT_FOUND,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
        });

        throw new AppError(404, "Usuario no encontrado", 'USER_NOT_FOUND');
    }

    const isValidPassword = await validatePassword(oldPassword, user.passwordHash);

    if (!isValidPassword) {
        await createAuditLog({
            action: AUDIT_ACTIONS.PASSWORD_CHANGE_FAILED,
            status: Status.FAILED,
            actorType: Actors.USER,
            actorId: user.id,
            actorRole: user.role,
            targetType: TargetType.USER,
            targetId: user.id,
            errorCode: AUDIT_ERROR_CODES.INVALID_PASSWORD,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email: user.email,
            },
        });

        throw new AppError(401, "Contraseña incorrecta", 'INVALID_PASSWORD');
    }

    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            passwordHash: await hashPassword(password)
        }
    });

    await createAuditLog({
        action: AUDIT_ACTIONS.PASSWORD_CHANGED,
        status: Status.SUCCESS,
        actorType: Actors.USER,
        actorId: user.id,
        actorRole: user.role,
        targetType: TargetType.USER,
        targetId: user.id,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
        additionalData: {
            email: user.email,
        },
    });

    await sendEmail({
        to: user.email,
        subject: 'Contraseña cambiada',
        html: `<p>Se ha cambiado su contraseña exitosamente. Si usted no ha realizado este cambio, por favor, pongase en contacto con soporte.</p>`
    });

    return {
        message: "Contraseña cambiada exitosamente",
        code: "PASSWORD_CHANGED_COMPLETED"
    };
}

export const recoverPasswordService = async (email: string, auditMeta: AuditRequestMeta = {}) => {

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        await createAuditLog({
            action: AUDIT_ACTIONS.PASSWORD_RECOVERY_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: null,
            targetId: null,
            errorCode: AUDIT_ERROR_CODES.USER_NOT_FOUND,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                email,
            },
        });

        throw new AppError(404, "Usuario no encontrado", 'USER_NOT_FOUND');
    }

    const secureToken = generateSecureToken();
    const hashSecureToken = hashToken(secureToken);

    const passwordResetToken = await prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            token: hashSecureToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        }
    });

    await createAuditLog({
        action: AUDIT_ACTIONS.PASSWORD_RECOVERY_REQUESTED,
        status: Status.SUCCESS,
        actorType: Actors.USER,
        actorId: user.id,
        actorRole: user.role,
        targetType: TargetType.PASSWORD_RESET_TOKEN,
        targetId: passwordResetToken.id,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
        additionalData: {
            email: user.email,
        },
    });

    await sendEmail({
        to: user.email,
        subject: 'Recuperar contraseña',
        html: `<p>Se ha enviado un nuevo enlace de recuperación de contraseña. Por favor, recupere su contraseña haciendo clic en el siguiente enlace:</p><a href="${process.env.FRONTEND_URL}/new-password?token=${secureToken}">Recuperar contraseña</a>`
    });

    return {
        message: "Se ha enviado un nuevo enlace de recuperación de contraseña",
        code: "PASSWORD_RECOVER_COMPLETED"
    };
}

export const newPasswordService = async (token: string, password: string, auditMeta: AuditRequestMeta = {}) => {

    const hashTokenValue = hashToken(token);

    const foundToken = await prisma.passwordResetToken.findUnique({
        where: {
            token: hashTokenValue,
        },
        include: {
            user: true
        }
    });

    if (!foundToken) {
        await createAuditLog({
            action: AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.PASSWORD_RESET_TOKEN,
            targetId: null,
            errorCode: AUDIT_ERROR_CODES.TOKEN_NOT_FOUND,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
        });

        throw new AppError(404, "Token no encontrado", 'TOKEN_NOT_FOUND');
    }

    if (foundToken.expiresAt < new Date()) {
        await createAuditLog({
            action: AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.PASSWORD_RESET_TOKEN,
            targetId: foundToken.id,
            errorCode: AUDIT_ERROR_CODES.TOKEN_EXPIRED,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                userId: foundToken.userId,
            },
        });

        throw new AppError(400, "Token expirado", 'TOKEN_EXPIRED');
    }

    if (foundToken.expiresAt < new Date()) {
        await createAuditLog({
            action: AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.PASSWORD_RESET_TOKEN,
            targetId: foundToken.id,
            errorCode: AUDIT_ERROR_CODES.TOKEN_USED,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
            additionalData: {
                userId: foundToken.userId,
            },
        });

        throw new AppError(400, "Token ya usado", 'TOKEN_USED');
    }

    await prisma.user.update({
        where: {
            id: foundToken.userId
        },
        data: {
            passwordHash: await hashPassword(password)
        }
    });

    await prisma.passwordResetToken.delete({
        where: {
            id: foundToken.id
        }
    });

    await createAuditLog({
        action: AUDIT_ACTIONS.PASSWORD_RESET_COMPLETED,
        status: Status.SUCCESS,
        actorType: Actors.USER,
        actorId: foundToken.userId,
        actorRole: foundToken.user.role,
        targetType: TargetType.USER,
        targetId: foundToken.userId,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
        additionalData: {
            resetTokenId: foundToken.id,
            email: foundToken.user.email,
        },
    });

    return {
        message: "Contraseña cambiada exitosamente",
        code: "PASSWORD_CHANGED_COMPLETED"
    };
}

export const closeSessionUnauthService = async (token: string, auditMeta: AuditRequestMeta = {}) => {

    const hashTokenValue = hashToken(token);

    const foundSession = await prisma.session.findUnique({
        where: {
            refreshToken: hashTokenValue,
        },
        include: {
            user: true
        }
    });

    if (!foundSession) {
        await createAuditLog({
            action: AUDIT_ACTIONS.SESSION_CLOSE_FAILED,
            status: Status.FAILED,
            actorType: Actors.ANONYMOUS,
            actorId: null,
            actorRole: null,
            targetType: TargetType.AUTH_SESSION,
            targetId: null,
            errorCode: AUDIT_ERROR_CODES.TOKEN_NOT_FOUND,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
        });

        throw new AppError(404, "Token no encontrado", 'TOKEN_NOT_FOUND');
    }

    if (foundSession.expiresAt < new Date()) {
        await createAuditLog({
            action: AUDIT_ACTIONS.SESSION_CLOSE_FAILED,
            status: Status.FAILED,
            actorType: Actors.USER,
            actorId: foundSession.userId,
            actorRole: foundSession.user.role,
            targetType: TargetType.AUTH_SESSION,
            targetId: foundSession.id,
            errorCode: AUDIT_ERROR_CODES.TOKEN_EXPIRED,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
        });

        throw new AppError(400, "Token expirado", 'TOKEN_EXPIRED');
    }

    if (foundSession.revoked) {
        await createAuditLog({
            action: AUDIT_ACTIONS.SESSION_CLOSE_FAILED,
            status: Status.FAILED,
            actorType: Actors.USER,
            actorId: foundSession.userId,
            actorRole: foundSession.user.role,
            targetType: TargetType.AUTH_SESSION,
            targetId: foundSession.id,
            errorCode: AUDIT_ERROR_CODES.SESSION_CLOSED,
            ipAddress: auditMeta.ipAddress ?? null,
            userAgent: auditMeta.userAgent ?? null,
        });

        throw new AppError(400, "Sesion ya cerrada", 'SESSION_CLOSED');
    }

    await prisma.session.update({
        where: {
            refreshToken: hashToken(token)
        },
        data: {
            revoked: true
        }
    });

    await createAuditLog({
        action: AUDIT_ACTIONS.SESSION_CLOSED_BY_SECURITY_LINK,
        status: Status.SUCCESS,
        actorType: Actors.USER,
        actorId: foundSession.userId,
        actorRole: foundSession.user.role,
        targetType: TargetType.AUTH_SESSION,
        targetId: foundSession.id,
        ipAddress: auditMeta.ipAddress ?? null,
        userAgent: auditMeta.userAgent ?? null,
    });

    return {
        message: "Sesion cerrada exitosamente",
        code: "SESSION_CLOSED_COMPLETED"
    };
}
