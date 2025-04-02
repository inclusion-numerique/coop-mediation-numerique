import z from 'zod'

export const UpdateConumInfoValidation = z.object({
  name: z.literal('update-conum-info'),
  payload: z.undefined(),
})

export type UpdateConumInfoJob = z.infer<typeof UpdateConumInfoValidation>
