import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { DefaultValues } from 'react-hook-form'
import { CraEvenementData } from '../validation/CraEvenementValidation'

export const getCraEvenementDataDefaultValuesFromExisting = async ({
  id,
  coordinateurId,
}: {
  id: string
  coordinateurId: string
}): Promise<
  | (DefaultValues<CraEvenementData> & {
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
      type: 'Evenement',
    },
    select: {
      date: true,
      duree: true,
      notes: true,
      nomEvenement: true,
      typeEvenement: true,
      typeEvenementAutre: true,
      participants: true,
      echelonTerritorial: true,
      organisateurs: true,
      organisateurAutre: true,
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
    nomEvenement,
    typeEvenement,
    typeEvenementAutre,
    participants,
    echelonTerritorial,
    organisateurs,
    organisateurAutre,
    tags,
  } = cra

  return {
    id,
    coordinateurId,
    date: dateAsIsoDay(date),
    notes: notes ?? undefined,
    nomEvenement: nomEvenement ?? undefined,
    typeEvenement: typeEvenement ?? undefined,
    typeEvenementAutre: typeEvenementAutre ?? undefined,
    participants: participants ?? undefined,
    echelonTerritorial: echelonTerritorial ?? undefined,
    organisateurs: organisateurs ?? undefined,
    organisateurAutre: organisateurAutre ?? undefined,
    tags: tags.map(({ tag }) => tag) ?? [],
  } satisfies DefaultValues<CraEvenementData>
}
