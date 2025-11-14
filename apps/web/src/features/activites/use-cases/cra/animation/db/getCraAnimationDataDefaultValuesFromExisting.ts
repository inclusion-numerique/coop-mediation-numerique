import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { DefaultValues } from 'react-hook-form'
import { minutesToCraDureeData } from '../../db/minutesToCraDuree'
import { CraAnimationData } from '../validation/CraAnimationValidation'

export const getCraAnimationDataDefaultValuesFromExisting = async ({
  id,
  coordinateurId,
}: {
  id: string
  coordinateurId: string
}): Promise<
  | (DefaultValues<CraAnimationData> & {
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
      type: 'Animation',
    },
    select: {
      date: true,
      duree: true,
      notes: true,
      initiative: true,
      typeAnimation: true,
      typeAnimationAutre: true,
      thematiquesAnimation: true,
      thematiqueAnimationAutre: true,
      mediateurs: true,
      structures: true,
      autresActeurs: true,
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
    duree,
    notes,
    initiative,
    typeAnimation,
    typeAnimationAutre,
    thematiquesAnimation,
    thematiqueAnimationAutre,
    mediateurs,
    structures,
    autresActeurs,
    tags,
  } = cra

  return {
    id,
    coordinateurId,
    date: dateAsIsoDay(date),
    duree: minutesToCraDureeData(duree) ?? {},
    notes: notes ?? undefined,
    initiative: initiative ?? undefined,
    typeAnimation: typeAnimation ?? undefined,
    typeAnimationAutre: typeAnimationAutre ?? undefined,
    thematiquesAnimation: thematiquesAnimation ?? undefined,
    thematiqueAnimationAutre: thematiqueAnimationAutre ?? undefined,
    mediateurs: mediateurs ?? undefined,
    structures: structures ?? undefined,
    autresActeurs: autresActeurs ?? undefined,
    tags: tags.map(({ tag }) => tag) ?? [],
  } satisfies DefaultValues<CraAnimationData>
}
