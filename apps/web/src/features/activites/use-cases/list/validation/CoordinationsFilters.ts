import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@app/web/libs/data-table/toNumberOr'
import { z } from 'zod'

const activiteTypes = ['Evenement', 'Partenariat', 'Animation'] as const

export const coordinationsFiltersSchema = z.object({
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
  tags: z
    .string()
    .transform((type: string) => type.split(',').map((v) => v.trim()))
    .optional(),
  du: z
    .preprocess(
      (val) => (val ? new Date(val as string) : undefined),
      z.date().optional(),
    )
    .refine((date) => !date || !Number.isNaN(date.getTime()), {
      message: 'La date de début est invalide',
    }),
  au: z
    .preprocess(
      (val) => (val ? new Date(val as string) : undefined),
      z.date().optional(),
    )
    .refine((date) => !date || !Number.isNaN(date.getTime()), {
      message: 'La date de fin est invalide',
    }),
})

export type CoordinationsFilters = {
  du?: Date
  au?: Date
  page: number
  lignes: number
  types: ('Animation' | 'Evenement' | 'Partenariat')[]
  tags: string[]
}

const DEFAULT_COORDINATION_FILTERS = {
  types: [],
  tags: [],
  page: DEFAULT_PAGE,
  lignes: DEFAULT_PAGE_SIZE,
}

export const validateCoordinationsFilters = (
  raw: unknown,
): CoordinationsFilters => {
  const result = coordinationsFiltersSchema.safeParse(raw)
  return result.success
    ? { ...DEFAULT_COORDINATION_FILTERS, ...result.data }
    : DEFAULT_COORDINATION_FILTERS
}
