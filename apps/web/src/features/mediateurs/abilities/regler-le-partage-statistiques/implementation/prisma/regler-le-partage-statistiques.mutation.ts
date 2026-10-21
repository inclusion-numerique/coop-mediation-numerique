import { type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { partageDuProprietaire } from '../../../../db/partage-du-proprietaire'
import type {
  AuteurId,
  PerimetrePartage,
  Rattachements,
} from '../../../../domain'
import {
  type AucuneStatistiqueAPartager,
  type PerimetreNonRattache,
  proprietaireChoisi,
} from '../../domain'

type Partage = ReturnType<typeof partageDuProprietaire>

const activer = (partage: Partage) =>
  prismaClient.partageStatistiques.upsert({
    where: partage,
    create: partage,
    update: { deleted: null },
  })

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
