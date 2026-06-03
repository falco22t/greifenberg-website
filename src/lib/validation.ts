import { z } from 'zod'

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Mindestens 3 Zeichen')
    .max(32, 'Maximal 32 Zeichen')
    .regex(/^[a-zA-Z0-9_.\-]+$/, 'Nur Buchstaben, Zahlen, _, . und - erlaubt'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z
    .string()
    .min(8, 'Mindestens 8 Zeichen')
    .max(128, 'Maximal 128 Zeichen'),
})

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Pflichtfeld'),
  password: z.string().min(1, 'Pflichtfeld'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
