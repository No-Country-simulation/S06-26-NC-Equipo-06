import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/app.error';

export const getMunicipalitiesService = async (userRole: string) => {
  if (userRole !== 'ADMIN') {
    throw new AppError(403, 'Usuario no autorizado', 'USER_NOT_AUTHORIZED');
  }
  const municipalities = await prisma.municipality.findMany({
    orderBy: {
      name: 'asc'
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return {
    message: 'Municipalidades encontradas exitosamente',
    code: 'MUNICIPALITIES_FOUND',
    data: municipalities
  };
}

export const getMunicipalityByIdService = async (id: string, userRole: string) => {
  if (userRole !== 'ADMIN') {
    throw new AppError(403, 'Usuario no autorizado', 'USER_NOT_AUTHORIZED');
  }
  const municipality = await prisma.municipality.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      localAdminProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true
            }
          }
        }
      },
      localEvaluator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true
            }
          }
        }
      }
    }
  });
  if (!municipality) {
    throw new AppError(404, 'Municipalidad no encontrada', 'MUNICIPALITY_NOT_FOUND');
  }
  return {
    message: 'Municipalidad encontrada exitosamente',
    code: 'MUNICIPALITY_FOUND',
    data: municipality
  };
};

export const createMunicipalityService = async (name: string, location: string, userRole: string) => {
  if (userRole !== 'ADMIN') {
    throw new AppError(403, 'Usuario no autorizado', 'USER_NOT_AUTHORIZED');
  }
  const normalizedName = name.trim();
  const normalizedLocation = location.trim();
  const existingMunicipality = await prisma.municipality.findFirst({
    where: {
      name: {
        equals: normalizedName,
        mode: 'insensitive'
      }
    }
  });
  if (existingMunicipality) {
    throw new AppError(409, 'La municipalidad ya existe', 'MUNICIPALITY_ALREADY_EXISTS');
  }
  const municipality = await prisma.municipality.create({
    data: {
      name: normalizedName,
      location: normalizedLocation
    },
    select: {
      id: true,
      name: true,
      location: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return {
    message: 'Municipalidad creada exitosamente',
    code: 'MUNICIPALITY_CREATED',
    data: municipality
  };
};

export const updateMunicipalityService = async (id: string, data: { name?: string }, userRole:string) => {
  if (userRole !== 'ADMIN') {
    throw new AppError(403, 'Usuario no autorizado', 'USER_NOT_AUTHORIZED');
  }
  const municipality = await prisma.municipality.findUnique({
    where: {
      id
    }
  });
  if (!municipality) {
          throw new AppError(404, 'Municipalidad no encontrada', 'MUNICIPALITY_NOT_FOUND');
      }

      if (data.name) {
          const normalizedName = data.name.trim();

          const existingMunicipality = await prisma.municipality.findFirst({
              where: {
                  id: {
                      not: id
                  },
                  name: {
                      equals: normalizedName,
                      mode: 'insensitive'
                  }
              }
          });

          if (existingMunicipality) {
              throw new AppError(409, 'La municipalidad ya existe', 'MUNICIPALITY_ALREADY_EXISTS');
          }

          data.name = normalizedName;
      }

      const updatedMunicipality = await prisma.municipality.update({
          where: {
              id
          },
          data,
          select: {
              id: true,
              name: true,
              createdAt: true,
              updatedAt: true
          }
      });

      return {
          message: 'Municipalidad actualizada exitosamente',
          code: 'MUNICIPALITY_UPDATED',
          data: updatedMunicipality
      };
  };

export const validateMunicipalityService = async (id: string, userRole: string) => {
  if (userRole !== 'ADMIN') {
    throw new AppError(403, 'Usuario no autorizado', 'USER_NOT_AUTHORIZED');
  }
  const findMunicipality = await prisma.municipality.findUnique({
    where: {
      id
    }
  });
  if (!findMunicipality) {
    throw new AppError(404, 'Municipalidad no encontrada', 'MUNICIPALITY_NOT_FOUND');
  }
  return {
    message: 'Municipalidad validada exitosamente',
    code: 'MUNICIPALITY_VALIDATED',
    data: findMunicipality
  };
}
