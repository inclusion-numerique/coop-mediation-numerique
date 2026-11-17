import z from 'zod'

export const RetirerLesRolesVacantsJobValidation = z.object({
  name: z.literal('retirer-les-roles-vacants'),
  payload: z.object({}).optional(),
})

export type RetirerLesRolesVacantsJob = z.infer<
  typeof RetirerLesRolesVacantsJobValidation
>
