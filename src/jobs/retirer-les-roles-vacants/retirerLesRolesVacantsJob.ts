import z from 'zod'

export const RetirerLesRolesVacantsJobValidation = z.object({
  name: z.literal('retirer-les-roles-vacants'),
  payload: z.object({}).optional(),
})
