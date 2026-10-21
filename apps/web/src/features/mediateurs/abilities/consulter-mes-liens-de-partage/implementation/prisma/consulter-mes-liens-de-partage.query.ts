import { prismaClient } from '@app/web/prismaClient'
import { partageDuProprietaire } from '../../../../db/partage-du-proprietaire'
import {
  LienDePartageId,
  type LienDuPerimetre,
  PerimetrePartage,
  type ProprietairePartage,
  proprietairesPossibles,
  type Rattachements,
} from '../../../../domain'

const lienDuProprietaire = async (
  proprietaire: ProprietairePartage,
): Promise<LienDuPerimetre> => {
  const partage = await prismaClient.partageStatistiques.findFirst({
    where: { ...partageDuProprietaire(proprietaire), deleted: null },
    select: { id: true },
  })

  return {
    perimetre: PerimetrePartage(proprietaire._tag),
    lien: partage === null ? null : LienDePartageId(partage.id),
  }
}

export const consulterMesLiensDePartage = (
  rattachements: Rattachements,
): Promise<readonly LienDuPerimetre[]> =>
  Promise.all(proprietairesPossibles(rattachements).map(lienDuProprietaire))
