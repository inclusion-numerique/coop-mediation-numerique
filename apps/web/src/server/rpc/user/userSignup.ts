import z from 'zod'

export const UserSignupValidation = z.object({
  email: z
    .string({ error: 'Veuillez renseigner votre email' })
    .trim()
    .toLowerCase()
    .pipe(z.email('Merci de renseigner un email valide')),
  firstName: z
    .string({ error: 'Veuillez renseigner votre prénom' })
    .trim()
    .min(1, 'Veuillez renseigner votre prénom'),
  lastName: z
    .string({ error: 'Veuillez renseigner votre nom' })
    .trim()
    .min(1, 'Veuillez renseigner votre nom'),
})

export type UserSignup = z.infer<typeof UserSignupValidation>
