import { Request, Response, NextFunction } from 'express';
import * as MunicipalityServices from './municipalities.services';
import { createMunicipalitySchema, municipalityParamsSchema, updateMunicipalitySchema } from './municipalities.schema';

export const getMunicipalitiesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const response = await MunicipalityServices.getMunicipalitiesService(user.role);

    res.status(200).json({
      success: true,
      message: response.message,
      code: response.code,
      data: response.data
    });
  } catch (error) {
    next(error)
  }
};

export const getMunicipalityByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = municipalityParamsSchema.parse(req.params);
    const response = await MunicipalityServices.getMunicipalityByIdService(id,user.role);

    res.status(200).json({
      success: true,
      message: response.message,
      code: response.code,
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};
export const createMunicipalityController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { name, location } = createMunicipalitySchema.parse(req.body);
    const response = await MunicipalityServices.createMunicipalityService(name, location, user.role);

    res.status(201).json({
      success: true,
      message: response.message,
      code: response.code,
      data: response.data
    });
  } catch (error) {
    next(error)
  }
};

export const updateMunicipalityController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = municipalityParamsSchema.parse(req.params);
    const data = updateMunicipalitySchema.parse(req.body);
    const response = await MunicipalityServices.updateMunicipalityService(id, data,user.role);

    res.status(200).json({
      success:true,
      message: response.message,
      code: response.code,
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};

export const validateMunicipalityController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = municipalityParamsSchema.parse(req.params);
    const responseService = await MunicipalityServices.validateMunicipalityService(id,user.role);

    res.status(200).json({
      success: true,
      message: responseService.message,
      code: responseService.code,
      data: responseService.data
    });
  } catch (error) {
    next(error);
  }
}
