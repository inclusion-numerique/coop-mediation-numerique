import { prismaClient } from '@app/web/prismaClient'
import { partageDuProprietaire } from '../../../../db/partage-du-proprietaire'
import {
  LienDePartageId,
  proprietairePartageDe,
  type Rattachements,
} from '../../../../domain'

export const consulterMonLienDePartage = async (
  rattachements: Rattachements,
): Promise<LienDePartageId | null> => {
  const proprietaire = proprietairePartageDe(rattachements)
  if (proprietaire === null) return null

  const partage = await prismaClient.partageStatistiques.findFirst({
    where: { ...partageDuProprietaire(proprietaire), deleted: null },
    select: { id: true },
  })

  return partage === null ? null : LienDePartageId(partage.id)
}
