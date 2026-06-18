import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/app.error';

export const getProfileService = async (userId: string, userRole: string) => {

    if (userRole === 'COMPANY') {

        const userData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                companyProfile: {
                    select: {
                        companyName: true,
                        ruc: true,
                        taxStatus: true,
                        fiscalAddress: true,
                    }
                }
            }
        });

        return { message: "Perfil de empresa encontrado", code: "COMPANY_PROFILE_FINDED", data: userData };
    } else if (userRole === 'ADMIN') {
        const userData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                adminProfile: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });

        return { message: "Perfil de administrador encontrado", code: "ADMIN_PROFILE_FINDED", data: userData };
    } else if (userRole === 'MUNICIPAL_ADMIN') {
        const userData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                localAdminProfile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        municipality: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        return { message: "Perfil de administrador municipal encontrado", code: "MUNICIPAL_ADMIN_PROFILE_FINDED", data: userData };
    } else if (userRole === 'MUNICIPAL_EVALUATOR') {
        const userData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                localEvaluator: {
                    select: {
                        firstName: true,
                        lastName: true,
                        municipality: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        return { message: "Perfil de evaluador municipal encontrado", code: "MUNICIPAL_EVALUATOR_PROFILE_FINDED", data: userData };
    } else {
        throw new AppError(403, "Rol no autorizado", "ROLE_NOT_AUTHORIZED");
    }

}

export const updateProfileService = async (userId: string, userRole: string, data: any) => {

    if (userRole === "COMPANY") {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                companyProfile: true
            }
        })

        if (!user) {
            throw new AppError(404, "Usuario no encontrado", "USER_NOT_FOUND");
        }

        if (user.role !== "COMPANY") {
            throw new AppError(403, "Usuario no autorizado", "USER_NOT_AUTHORIZED");
        }

        if (userId !== user.id) {
            throw new AppError(403, "Usuario no autorizado", "USER_NOT_AUTHORIZED");
        }

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                email: data.email || user.email,
                companyProfile: {
                    update: {
                        companyName: data.companyName || user.companyProfile?.companyName,
                        taxStatus: data.taxStatus || user.companyProfile?.taxStatus,
                        fiscalAddress: data.fiscalAddress || user.companyProfile?.fiscalAddress
                    }
                }
            }
        })

        return { message: "Perfil de empresa actualizado exitosamente", code: "COMPANY_PROFILE_UPDATED_SUCCESS" };

    } else if (userRole === "ADMIN") {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                adminProfile: true
            }
        })

        if (!user) {
            throw new AppError(404, "Usuario no encontrado", "USER_NOT_FOUND");
        }

        if (user.role !== "ADMIN") {
            throw new AppError(403, "Usuario no autorizado", "USER_NOT_AUTHORIZED");
        }

        if (userId !== user.id) {
            throw new AppError(403, "Usuario no autorizado", "USER_NOT_AUTHORIZED");
        }

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                email: data.email || user.email,
                adminProfile: {
                    update: {
                        firstName: data.firstName || user.adminProfile?.firstName,
                        lastName: data.lastName || user.adminProfile?.lastName
                    }
                }
            }
        })

        return { message: "Perfil de administrador actualizado exitosamente", code: "ADMIN_PROFILE_UPDATED_SUCCESS" };

    } else if (userRole === "MUNICIPAL_ADMIN") {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                localAdminProfile: true
            }
        })

        if (!user) {
            throw new AppError(404, "Usuario no encontrado", "USER_NOT_FOUND");
        }

        if (user.role !== "MUNICIPAL_ADMIN") {
            throw new AppError(403, "Usuario no autorizado", "USER_NOT_AUTHORIZED");
        }

        if (userId !== user.id) {
            throw new AppError(403, "Usuario no autorizado", "USER_NOT_AUTHORIZED");
        }

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                email: data.email || user.email,
                localAdminProfile: {
                    update: {
                        firstName: data.firstName || user.localAdminProfile?.firstName,
                        lastName: data.lastName || user.localAdminProfile?.lastName
                    }
                }
            }
        })

        return { message: "Perfil de administrador municipal actualizado exitosamente", code: "MUNICIPAL_ADMIN_PROFILE_UPDATED_SUCCESS" };
    } else if (userRole === "MUNICIPAL_EVALUATOR") {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                localEvaluator: true
            }
        })

        if (!user) {
            throw new AppError(404, "Usuario no encontrado", "USER_NOT_FOUND");
        }

        if (user.role !== "MUNICIPAL_EVALUATOR") {
            throw new AppError(403, "Usuario no autorizado", "USER_NOT_AUTHORIZED");
        }

        if (userId !== user.id) {
            throw new AppError(403, "Usuario no autorizado", "USER_NOT_AUTHORIZED");
        }

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                email: data.email || user.email,
                localEvaluator: {
                    update: {
                        firstName: data.firstName || user.localEvaluator?.firstName,
                        lastName: data.lastName || user.localEvaluator?.lastName
                    }
                }
            }
        })

        return { message: "Perfil de evaluador municipal actualizado exitosamente", code: "MUNICIPAL_EVALUATOR_PROFILE_UPDATED_SUCCESS" };
    } else {
        throw new AppError(403, "Usuario no autorizado", "USER_NOT_AUTHORIZED");
    }
}