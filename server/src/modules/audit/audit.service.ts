import { prisma } from "../../config/prisma";
import { AuditLogInput } from "./audit.types";

export const createAuditLog = async (input: AuditLogInput) => {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        status: input.status,
        actorId: input.actorId ?? null,
        actorType: input.actorType,
        actorRole: input.actorRole ?? null,
        municipalityId: input.municipalityId ?? null,
        errorCode: input.errorCode ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        additionalData: input.additionalData ?? undefined,
      },
    });
  } catch (error) {
    console.error("[AUDIT_ERROR]", error);
  }
};
