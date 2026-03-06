import z from 'zod'

export const ChangeUserRolesValidation = z.object({
  userId: z
    .string({
      required_error: "Veuillez renseigner l'id de l'utilisateur",
    })
    .uuid('Veuillez renseigner un id valide'),
  isMediateur: z.boolean(),
  isCoordinateur: z.boolean(),
})

export type ChangeUserRolesData = z.infer<typeof ChangeUserRolesValidation>
