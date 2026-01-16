import z from 'zod'

export const LieuxFilterValidations = {
  recherche: z.string().optional(),
  mediateurs: z
    .union([
      z.string().transform((val) => val.split(',').map((id) => id.trim())),
      z.array(z.string().uuid()),
    ])
    .optional(),
  communes: z
    .union([
      z.string().transform((val) => val.split(',').map((val) => val.trim())),
      z.array(z.string().length(5)),
    ])
    .optional(),
  departements: z
    .union([
      z.string().transform((val) => val.split(',').map((val) => val.trim())),
      z.array(z.string().max(3)),
    ])
    .optional(),
}

export type LieuxSortOption = 'nomaz' | 'nomza' | 'majrecent' | 'majancien'

export type LieuxFilters = {
  recherche?: string
  mediateurs?: string[] // UUIDs of mediateurs
  communes?: string[] // INSEE codes
  departements?: string[] // Dept codes for filtering within location
}

export type LieuxSearchParams = LieuxFilters & {
  page?: string
  lignes?: string
  tri?: LieuxSortOption
}

/**
 * Validate and sanitize search params for lieux
 * This is required as some values are used for queries and must be validated
 */
export const validateLieuxFilters = <T extends LieuxSearchParams>(
  searchParams: T,
): T => {
  const result = { ...searchParams }

  for (const key of Object.keys(LieuxFilterValidations)) {
    const typedKey = key as keyof typeof LieuxFilterValidations
    if (!(typedKey in result)) {
      continue
    }

    const validatedFilterValue = LieuxFilterValidations[typedKey].safeParse(
      result[typedKey],
    )

    if (
      validatedFilterValue.success &&
      validatedFilterValue.data !== undefined
    ) {
      ;(result as Record<string, unknown>)[typedKey] = validatedFilterValue.data
    } else {
      delete (result as Record<string, unknown>)[typedKey]
    }
  }

  return result
}
