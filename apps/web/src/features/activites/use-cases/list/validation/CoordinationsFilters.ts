import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@app/web/libs/data-table/toNumberOr'
import { z } from 'zod'

const activiteTypes = ['Evenement', 'Partenariat', 'Animation'] as const

const coordinationsFiltersSchema = z.object({
  page: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => !Number.isNaN(val) && val > 0, {
      message: 'le nombre de pages doit être > 0',
    })
    .optional(),
  lignes: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => !Number.isNaN(val) && val > 0, {
      message: 'le nombre de lignes doit être > 0',
    })
    .optional(),
  types: z
    .string()
    .transform((type: string) =>
      type
        .split(',')
        .map((v) => v.trim())
        .filter((v): v is (typeof activiteTypes)[number] =>
          activiteTypes.includes(v as (typeof activiteTypes)[number]),
        ),
    )
    .optional(),
})

export const validateCoordinationsFilters = (raw: unknown) => {
  const result = coordinationsFiltersSchema.safeParse(raw)
  return result.success
    ? result.data
    : { page: DEFAULT_PAGE, lignes: DEFAULT_PAGE_SIZE }
}

export type CoordinationsFilters = z.infer<typeof coordinationsFiltersSchema>
