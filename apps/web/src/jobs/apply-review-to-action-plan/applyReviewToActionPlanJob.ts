import z from 'zod'

export const ApplyReviewToActionPlanJobValidation = z.object({
  name: z.literal('apply-review-to-action-plan'),
  payload: z
    .object({
      reviewFile: z.string(), // filename in output/audit-structures/
    })
    .optional(),
})

export type ApplyReviewToActionPlanJob = z.infer<
  typeof ApplyReviewToActionPlanJobValidation
>
