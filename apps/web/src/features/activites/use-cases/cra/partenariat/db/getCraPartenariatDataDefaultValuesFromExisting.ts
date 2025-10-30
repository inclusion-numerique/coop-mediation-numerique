import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { DefaultValues } from 'react-hook-form'
import { CraPartenariatData } from '../validation/CraPartenariatValidation'

export const getCraPartenariatDataDefaultValuesFromExisting = async ({
  id,
  coordinateurId,
}: {
  id: string
  coordinateurId: string
}): Promise<
  | (DefaultValues<CraPartenariatData> & {
      id: string
      coordinateurId: string
    })
  | null
> => {
  const cra = await prismaClient.activiteCoordination.findUnique({
    where: {
      id,
      coordinateurId,
      suppression: null,
      type: 'Partenariat',
    },
    select: {
      date: true,
      duree: true,
      notes: true,
      naturePartenariat: true,
      naturePartenariatAutre: true,
      echelonTerritorial: true,
      structuresPartenaires: true,
      tags: {
        select: {
          tag: {
            select: { id: true, nom: true },
          },
        },
      },
    },
  })

  if (!cra) {
    return null
  }

  const {
    date,
    notes,
    naturePartenariat,
    naturePartenariatAutre,
    echelonTerritorial,
    structuresPartenaires,
    tags,
  } = cra

  return {
    id,
    coordinateurId,
    date: dateAsIsoDay(date),
    notes: notes ?? undefined,
    naturePartenariat: naturePartenariat ?? undefined,
    naturePartenariatAutre: naturePartenariatAutre ?? undefined,
    echelonTerritorial: echelonTerritorial ?? undefined,
    structuresPartenaires:
      (structuresPartenaires as CraPartenariatData['structuresPartenaires']) ??
      undefined,
    tags: tags.map(({ tag }) => tag) ?? [],
  } satisfies DefaultValues<CraPartenariatData>
}
