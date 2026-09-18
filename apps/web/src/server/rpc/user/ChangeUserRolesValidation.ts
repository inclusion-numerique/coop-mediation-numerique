import z from 'zod'

export const ChangeUserRolesValidation = z.object({
  userId: z
    .string({
      error: "Veuillez renseigner l'id de l'utilisateur",
    })
    .pipe(z.guid('Veuillez renseigner un id valide')),
  isMediateur: z.boolean(),
  isCoordinateur: z.boolean(),
})

export type ChangeUserRolesData = z.infer<typeof ChangeUserRolesValidation>
