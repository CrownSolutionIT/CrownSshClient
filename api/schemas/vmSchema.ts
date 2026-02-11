import { z } from 'zod';

export const createVMSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    ip: z.string().min(1, 'IP is required'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().optional(),
    port: z.number().int().optional().default(22),
    environmentId: z.string().optional(),
  }),
});

export const updateVMSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    ip: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    port: z.number().int().optional(),
    environmentId: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});
