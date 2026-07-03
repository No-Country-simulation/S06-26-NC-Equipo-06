import { prisma } from "../../config/prisma";
import { AppError } from '../../utils/app.error';
import { moveFilesToTenderFolder } from "../../utils/multer.helper";
import { fromFile } from "file-type";

export const createTenderService = async (data: any, userId: string, files: Express.Multer.File[] = []) => {

    const checkUser = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!checkUser) {
        throw new AppError(404, "Usuario no encontrado", 'USER_NOT_FOUND');
    }

    if (checkUser.role !== "MUNICIPAL_EVALUATOR") {
        throw new AppError(403, "Usuario no autorizado", 'USER_NOT_AUTHORIZED');
    }

    if (!checkUser.isActive) {
        throw new AppError(409, "Cuenta inactiva", 'ACCOUNT_NOT_ACTIVE');
    }

    const findProfileUser = await prisma.localEvaluator.findUnique({
        where: {
            userId: userId
        },
        include: {
            municipality: true
        }
    })

    if (!findProfileUser) {
        throw new AppError(404, "Perfil de usuario no encontrado", 'PROFILE_NOT_FOUND');
    }

    const findMunicipality = await prisma.municipality.findUnique({
        where: {
            id: findProfileUser.municipalityId
        }
    })

    if (!findMunicipality) {
        throw new AppError(404, "Municipio no encontrado", 'MUNICIPALITY_NOT_FOUND');
    }

    const documentsTender = data.documents.map((document: any) => {
        const matchingFile = files.find(f => f.originalname === document.fileName);

        if (!matchingFile) {
            throw new AppError(400, `Archivo no encontrado: ${document.fileName}`, 'FILE_NOT_FOUND');
        }

        return {
            documentType: document.documentType,
            fileName: document.fileName,
            matchingFile
        };
    });

    try {

        const createNewTender = await prisma.tenders.create({
            data: {
                idCreator: findProfileUser.id,
                status: data.action === 'DRAFT' ? 'DRAFT' : 'PENDING',
                title: data.title,
                ubication: data.ubication,
                coorX: data.coorX,
                coorY: data.coorY,
                description: data.description,
                executionPeriod: data.executionPeriod,
                contact: data.contact,
                municipality: `${findMunicipality.name} - ${findMunicipality.location}`
            }
        })

        await Promise.all(data.tenderSchedule.map((schedule: any) =>
            prisma.tenderSchedule.create({
                data: {
                    idTender: createNewTender.id,
                    schedule: schedule.schedule,
                    scheduleTimeLine: schedule.scheduleTimeLine
                }
            })
        ));

        if (files && files.length > 0) {
            moveFilesToTenderFolder(files, createNewTender.title);
        }

        await Promise.all(documentsTender.map(async (document: any) => {
            const realType = await fromFile(document.matchingFile.path).catch(() => null);

            await prisma.documentsTender.create({
                data: {
                    idTender: createNewTender.id,
                    documentType: realType?.mime ?? document.matchingFile.mimetype,
                    fileName: document.fileName
                }
            });
        }));

        await Promise.all(data.requirements.map((requirement: any) =>
            prisma.requirements.create({
                data: {
                    idTender: createNewTender.id,
                    requirement: requirement.requirement,
                    validationSchema: JSON.stringify(requirement.validationSchema)
                }
            })
        ));

        return {
            message: "Licitación creada exitosamente",
            code: "TENDER_CREATED"
        }

    } catch (error: any) {
        throw new AppError(500, "Error al crear la licitación, " + error.message, "ERROR_CREATING_TENDER");
    }

}

export const updateTenderService = async (data: any, userId: string, idTender: string) => {
    const tender = await prisma.tenders.findUnique({
        where: {
            id: idTender,
            OR: [
                { status: 'DRAFT' },
                { status: 'REJECTED' }
            ]
        }
    })

    if (!tender) {
        throw new AppError(404, "Licitación no encontrada", 'TENDER_NOT_FOUND');
    }

    if (tender.idCreator !== userId) {
        throw new AppError(403, "Usuario no autorizado", 'USER_NOT_AUTHORIZED');
    }

    await prisma.tenders.update({
        where: {
            id: idTender
        },
        data: {
            title: data.title ?? tender.title,
            ubication: data.ubication ?? tender.ubication,
            coorX: data.coorX ?? tender.coorX,
            coorY: data.coorY ?? tender.coorY,
            description: data.description ?? tender.description,
            executionPeriod: data.executionPeriod ?? tender.executionPeriod,
            contact: data.contact ?? tender.contact,
            municipality: data.municipality ?? tender.municipality
        }
    })

    if (data.tenderSchedule) {
        for (const schedule of data.tenderSchedule) {
            if (schedule.idSchedule) {
                const scheduleExists = await prisma.tenderSchedule.findUnique({
                    where: {
                        id: schedule.idSchedule
                    }
                })
                if (!scheduleExists) {
                    throw new AppError(404, "Cronograma no encontrado", 'SCHEDULE_NOT_FOUND');
                }
                await prisma.tenderSchedule.update({
                    where: {
                        id: schedule.idSchedule
                    },
                    data: {
                        schedule: schedule.schedule ?? scheduleExists.schedule,
                        scheduleTimeLine: schedule.scheduleTimeLine ?? scheduleExists.scheduleTimeLine
                    }
                })
            }
        }
    }

    if (data.requirements) {
        for (const requirement of data.requirements) {
            if (requirement.idRequirement) {
                const requirementExists = await prisma.requirements.findUnique({
                    where: {
                        id: requirement.idRequirement
                    }
                })
                if (!requirementExists) {
                    throw new AppError(404, "Requisito no encontrado", 'REQUIREMENT_NOT_FOUND');
                }
                await prisma.requirements.update({
                    where: {
                        id: requirement.idRequirement
                    },
                    data: {
                        requirement: requirement.requirement ?? requirementExists.requirement,
                        validationSchema: JSON.stringify(requirement.validationSchema) ?? JSON.stringify(requirementExists.validationSchema)
                    }
                })
            }
        }
    }

    return {
        message: "Licitación actualizada exitosamente",
        code: "TENDER_UPDATED"
    }
}