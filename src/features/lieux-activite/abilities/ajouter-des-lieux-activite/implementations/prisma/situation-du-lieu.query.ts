import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { NouvelIdentifiantDeLieu } from '../../../../domain/ports'
import type { LieuPorteurDeLaCarto, LireLEtatDuLieu } from '../../domain'

export const nouvelIdentifiantDeLieu: NouvelIdentifiantDeLieu = () =>
  LieuId(v4())

export const etatDuLieu: LireLEtatDuLieu = async (lieuId) => {
  const lieu = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { suppression: true },
  })

  if (lieu === null) return null

  return lieu.suppression === null ? 'Actif' : 'Inactif'
}

export const lieuPorteurDeLaCarto: LieuPorteurDeLaCarto = async (
  identifiant,
) => {
  const porteur = await prismaClient.lieuInclusion.findFirst({
    where: {
      suppression: null,
      inscriptionRegistre: { structureCartographieNationaleId: identifiant },
    },
    select: { id: true },
  })

  return porteur === null ? null : LieuId(porteur.id)
}
