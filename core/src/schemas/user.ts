import * as z from 'zod';

export const createUserSchema = z.object({
  name: z.string().trim().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(['user', 'agent', 'admin']),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object({
  name: z.string().trim().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).optional().or(z.literal('')),
  role: z.enum(['user', 'agent', 'admin']),
});

export type EditUserInput = z.infer<typeof editUserSchema>;
