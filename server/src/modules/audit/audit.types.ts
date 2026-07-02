import { Actors, Prisma, Role, Status, TargetType } from "@prisma/client";

export type AuditLogInput = {
  action: string;
  status: Status;
  actorId?: string | null;
  actorType: Actors;
  actorRole?: Role | null;
  municipalityId?: string | null;
  errorCode?: string | null;
  targetType?: TargetType | null;
  targetId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  additionalData?: Prisma.InputJsonValue | null;
};
