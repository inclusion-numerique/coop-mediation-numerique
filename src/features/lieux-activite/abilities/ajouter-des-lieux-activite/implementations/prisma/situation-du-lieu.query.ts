import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import type {
  EstUnLieuActif,
  LieuPorteurDeLaCarto,
  NouvelIdentifiantDeLieu,
} from '../../domain'

export const nouvelIdentifiantDeLieu: NouvelIdentifiantDeLieu = () =>
  LieuId(v4())

export const estUnLieuActif: EstUnLieuActif = async (lieuId) =>
  (await prismaClient.lieuInclusion.count({
    where: { id: lieuId, suppression: null },
  })) > 0

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
