import z from 'zod'

export const DeleteTagValidation = z.object({
  id: z.string().uuid(),
})
