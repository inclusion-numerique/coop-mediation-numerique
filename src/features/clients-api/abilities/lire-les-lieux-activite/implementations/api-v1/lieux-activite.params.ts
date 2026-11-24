import { DispositifProgrammeNational } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { z } from 'zod'
import { IdsValidation } from '@/features/clients-api/implementations/api-v1'

export const LieuxActiviteQueryParamsValidation = z.object({
  ids: IdsValidation,
  filter: z
    .object({
      dispositif_programmes_nationaux: z
        .enum(DispositifProgrammeNational)
        .optional(),
    })
    .default({}),
})

type LieuxActiviteQueryParams = z.infer<
  typeof LieuxActiviteQueryParamsValidation
>

export const criteresDesLieuxActivite = (
  queryParams: LieuxActiviteQueryParams,
) => ({
  ids: queryParams.ids,
  ...(queryParams.filter.dispositif_programmes_nationaux === undefined
    ? {}
    : {
        dispositifProgrammeNational:
          queryParams.filter.dispositif_programmes_nationaux,
      }),
})
