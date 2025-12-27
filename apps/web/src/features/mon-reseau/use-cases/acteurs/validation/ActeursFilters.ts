import z from 'zod'

export const acteurRoleValues = [
  'conseiller_numerique',
  'mediateur_numerique',
] as const

export type ActeurRole = (typeof acteurRoleValues)[number]

export const acteurRoleLabels: { [key in ActeurRole]: string } = {
  conseiller_numerique: 'Conseiller Numérique',
  mediateur_numerique: 'Médiateur numérique',
}

export const ActeursFilterValidations = {
  recherche: z.string().optional(),
  role: z.enum(acteurRoleValues).optional(),
  lieux: z
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

export type ActeursSortOption = 'nomaz' | 'nomza'

export type ActeursFilters = {
  recherche?: string
  role?: ActeurRole
  lieux?: string[] // UUIDs of structures
  communes?: string[] // INSEE codes
  departements?: string[] // Dept codes for filtering within location
}

export type ActeursSearchParams = ActeursFilters & {
  departement: string // Required department context from URL
  page?: string
  lignes?: string
  tri?: ActeursSortOption
}

/**
 * Validate and sanitize search params for acteurs
 * This is required as some values are used for queries and must be validated
 */
export const validateActeursFilters = <T extends ActeursSearchParams>(
  searchParams: T,
): T => {
  const result = { ...searchParams }

  for (const key of Object.keys(ActeursFilterValidations)) {
    const typedKey = key as keyof typeof ActeursFilterValidations
    if (!(typedKey in result)) {
      continue
    }

    const validatedFilterValue = ActeursFilterValidations[typedKey].safeParse(
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
