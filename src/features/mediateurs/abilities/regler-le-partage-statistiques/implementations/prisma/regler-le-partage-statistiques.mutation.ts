import { randomUUID } from 'node:crypto'
import { addMutationLog } from '@/configuration/prisma/addMutationLog'
import { prismaClient } from '@/configuration/prisma/prismaClient'
import { createStopwatch } from '@/libraries/chronometre/stopwatch'
import { type Result, success } from '@/libraries/result'
import type {
  AuteurId,
  PerimetrePartage,
  Rattachements,
} from '../../../../domain'
import { partageDuProprietaire } from '../../../../implementations/prisma/partage-du-proprietaire.query'
import {
  type AucuneStatistiqueAPartager,
  type PerimetreNonRattache,
  proprietaireChoisi,
} from '../../domain'

type Partage = ReturnType<typeof partageDuProprietaire>

const reactiverAvecUnNouveauLien = (partage: Partage) =>
  prismaClient.partageStatistiques.updateMany({
    where: { ...partage, deleted: { not: null } },
    data: { id: randomUUID(), deleted: null },
  })

const activer = async (partage: Partage) => {
  await reactiverAvecUnNouveauLien(partage)
  await prismaClient.partageStatistiques.upsert({
    where: partage,
    create: partage,
    update: {},
  })
}

const desactiver = (partage: Partage, maintenant: Date) =>
  prismaClient.partageStatistiques.updateMany({
    where: { ...partage, deleted: null },
    data: { deleted: maintenant },
  })

export const reglerLePartageStatistiques = async ({
  rattachements,
  perimetre,
  actif,
  auteurId,
  maintenant = new Date(),
}: {
  readonly rattachements: Rattachements
  readonly perimetre: PerimetrePartage
  readonly actif: boolean
  readonly auteurId: AuteurId
  readonly maintenant?: Date
}): Promise<
  Result<void, AucuneStatistiqueAPartager | PerimetreNonRattache>
> => {
  const stopwatch = createStopwatch()

  const proprietaire = proprietaireChoisi(rattachements, perimetre)
  if (!proprietaire.success) return proprietaire

  const partage = partageDuProprietaire(proprietaire.data)
  await (actif ? activer(partage) : desactiver(partage, maintenant))

  addMutationLog({
    userId: auteurId,
    nom: 'ReglerPartageStatistiques',
    duration: stopwatch.stop().duration,
    data: { ...partage, actif },
  })

  return success(undefined)
}
