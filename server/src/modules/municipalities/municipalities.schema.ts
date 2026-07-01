import { z } from 'zod';

export const municipalityParamsSchema = z.object({
  id: z.string().uuid('Invalid municipality id')
});

export const createMunicipalitySchema = z.object({
  name: z.string().trim().min(2,'Municipality name must be at least 2 characters long')
});

export const updateMunicipalitySchema = createMunicipalitySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' }
);
