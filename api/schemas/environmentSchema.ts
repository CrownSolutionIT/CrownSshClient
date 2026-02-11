import { z } from 'zod';

export const createEnvironmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
});

export const updateEnvironmentSchema = z.object({
  body: z.object({
    name: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});
