import z from 'zod';

export const createTenderSchema = z.object({
    action: z.enum(['SEND', 'DRAFT']),
    title: z.string().min(1, "El nombre de la licitación debe tener al menos 1 caracter."),
    location: z.string().min(1, "La ubicación de la licitación debe tener al menos 1 caracter."),
    coorX: z.number(),
    coorY: z.number(),
    description: z.string().min(1, "La descripción de la licitación debe tener al menos 1 caracter."),
    executionPeriod: z.string().min(1, "El período de ejecución de la licitación debe tener al menos 1 caracter."),
    contact: z.string(),
    municipality: z.string(),
    tenderSchedule: z.array(
        z.object({
            schedule: z.enum(['CALL_FOR_APPLICATIONS', 'PARTICIPANT_REGISTRATION', 'SUBMISSION_OF_PROPOSALS', 'AWARD_OF_TENDER']),
            scheduleTimeLine: z.string()
        })
    ),
    requirements: z.array(
        z.object({
            requirement: z.string().min(1, "El nombre de la licitación debe tener al menos 1 caracter."),
            validationSchema: z.object({
                minValue: z.number().optional(),
                maxValue: z.number().optional(),
                minLength: z.number().optional(),
                maxLength: z.number().optional(),
                pattern: z.string().optional(),
            }).optional()
        })
    )
});

export const updateTenderSchema = z.object({
    title: z.string().min(1, "El nombre de la licitación debe tener al menos 1 caracter.").optional(),
    location: z.string().min(1, "La ubicación de la licitación debe tener al menos 1 caracter.").optional(),
    coorX: z.number().optional(),
    coorY: z.number().optional(),
    description: z.string().min(1, "La descripción de la licitación debe tener al menos 1 caracter.").optional(),
    executionPeriod: z.string().min(1, "El período de ejecución de la licitación debe tener al menos 1 caracter.").optional(),
    contact: z.string().optional(),
    municipality: z.string().optional(),
    tenderSchedule: z.array(
        z.object({
            idSchedule: z.string().optional(),
            schedule: z.enum(['CALL_FOR_APPLICATIONS', 'PARTICIPANT_REGISTRATION', 'SUBMISSION_OF_PROPOSALS', 'AWARD_OF_TENDER']).optional(),
            scheduleTimeLine: z.string().optional()
        })
    ).optional(),
    requirements: z.array(
        z.object({
            idRequirement: z.string().optional(),
            requirement: z.string().min(1, "El nombre de la licitación debe tener al menos 1 caracter.").optional(),
            validationSchema: z.object({
                minValue: z.number().optional(),
                maxValue: z.number().optional(),
                minLength: z.number().optional(),
                maxLength: z.number().optional(),
                pattern: z.string().optional(),
            }).optional()
        })
    ).optional()
});

export const idSchema = z.object({
    id: z.string().uuid().min(1, "El id de la licitación es invalido.")
});