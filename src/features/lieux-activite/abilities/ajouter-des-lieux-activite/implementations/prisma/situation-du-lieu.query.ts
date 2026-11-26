import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import type {
  EstUnLieuActif,
  LieuPorteurDeLaCarto,
  LieuxAuMemeEndroit,
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

export const lieuxAuMemeEndroit: LieuxAuMemeEndroit = async ({
  codeInsee,
  codePostal,
}) =>
  (
    await prismaClient.lieuInclusion.findMany({
      where: {
        banId: { not: null },
        OR: [{ codeInsee }, { codePostal }],
      },
      orderBy: { creation: 'asc' },
      select: {
        id: true,
        nom: true,
        adresse: true,
        latitude: true,
        longitude: true,
        commune: true,
        codePostal: true,
        codeInsee: true,
        suppression: true,
        typologies: true,
      },
    })
  ).map((candidat) => ({ ...candidat, id: LieuId(candidat.id) }))
