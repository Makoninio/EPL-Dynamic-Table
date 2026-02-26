import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_API_BASE: z.string().url(),
});

export const env = schema.parse({
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
});
