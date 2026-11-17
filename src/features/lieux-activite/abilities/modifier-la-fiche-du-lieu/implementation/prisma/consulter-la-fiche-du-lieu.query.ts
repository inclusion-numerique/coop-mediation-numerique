import { nomAffiche } from '@app/web/libraries/nom-affiche'
import { prismaClient } from '@app/web/prismaClient'
import type { LieuId } from '../../../../domain/lieu-id'
import type { MediateurId } from '../../../../domain/mediateur-id'
import { lieuCoopToDomain, lieuToDomain } from '../../../../implementation'
import { inscriptionPourLaFiche } from '../../../../implementation/prisma/registre'
import {
  type FicheDuLieu,
  NombreDActivites,
  NombreDeMediateurs,
} from '../../domain'

export const consulterLaFicheDuLieu = async (
  id: LieuId,
  consultePar: MediateurId | null = null,
): Promise<FicheDuLieu | null> => {
  const ligne = await prismaClient.lieuInclusion.findFirst({
    where: { id, suppression: null },
    include: {
      _count: {
        select: {
          activites: { where: { suppression: null } },
          mediateursEnActivite: {
            where: {
              suppression: null,
              fin: null,
              mediateur: { user: { deleted: null } },
              ...(consultePar == null
                ? {}
                : { mediateurId: { not: consultePar } }),
            },
          },
        },
      },
      inscriptionRegistre: inscriptionPourLaFiche,
      derniereModificationPar: {
        select: { name: true, firstName: true, lastName: true, email: true },
      },
    },
  })

  if (ligne == null) return null

  const { derniereModificationPar, _count, ...lieu } = ligne

  return {
    lieu: lieuToDomain(lieu),
    ficheCoop: lieuCoopToDomain(lieu).fiche,
    derniereModificationCoop: lieu.modification,
    partage: {
      autresMediateurs: NombreDeMediateurs(_count.mediateursEnActivite),
      activites: NombreDActivites(_count.activites),
    },
    auteurDerniereModification:
      derniereModificationPar == null
        ? null
        : nomAffiche({
            prenom: derniereModificationPar.firstName,
            nom: derniereModificationPar.lastName,
            nomComplet: derniereModificationPar.name,
            courriel: derniereModificationPar.email,
          }),
  }
}
