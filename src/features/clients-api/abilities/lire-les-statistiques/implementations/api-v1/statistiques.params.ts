import { z } from 'zod'

export const statistiquesQueryParamsValidation = <TFiltres extends z.ZodType>(
  filtres: TFiltres,
) => z.object({ filter: filtres })
