import z from 'zod';

export const createTenderSchema = z.object({
    action: z.enum(['SEND', 'DRAFT']),
    title: z.string().min(1, "El nombre de la licitación debe tener al menos 1 caracter."),
    ubication: z.string().min(1, "La ubicación de la licitación debe tener al menos 1 caracter."),
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