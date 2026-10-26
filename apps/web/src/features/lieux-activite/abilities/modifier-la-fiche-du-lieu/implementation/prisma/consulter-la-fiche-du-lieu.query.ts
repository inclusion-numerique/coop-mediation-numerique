import { nomAffiche } from '@app/web/libraries/nom-affiche'
import { prismaClient } from '@app/web/prismaClient'
import type { Fiche } from '../../../../domain/fiche'
import type { Lieu } from '../../../../domain/lieu'
import type { LieuId } from '../../../../domain/lieu-id'
import { lieuCoopToDomain, lieuToDomain } from '../../../../implementation'
import { inscriptionPourLaFiche } from '../../../../implementation/prisma/registre'

export type FicheDuLieu = {
  readonly lieu: Lieu
  readonly auteurDerniereModification: string | null
  /**
   * Quand la coop a modifié la fiche pour la dernière fois.
   *
   * Distincte de `lieu.tracabilite.derniereModification.date`, qui porte celle
   * du dernier écrivain quel qu'il soit : dès qu'un producteur tiers reprend la
   * fiche, la date du médiateur disparaîtrait du domaine, et c'est précisément
   * celle qu'il faut lui remontrer pour qu'il situe la reprise.
   */
  readonly derniereModificationCoop: Date
  /**
   * La fiche telle que la COOP l'a enregistrée, face à `lieu.fiche` qui vient du
   * registre. Les deux sont les deux côtés du difftool : ce que le médiateur
   * avait saisi, et ce qu'on lui montre aujourd'hui.
   */
  readonly ficheCoop: Fiche
}

export const consulterLaFicheDuLieu = async (
  id: LieuId,
): Promise<FicheDuLieu | null> => {
  const ligne = await prismaClient.lieuInclusion.findFirst({
    where: { id, suppression: null },
    include: {
      inscriptionRegistre: inscriptionPourLaFiche,
      derniereModificationPar: {
        select: { name: true, firstName: true, lastName: true, email: true },
      },
    },
  })

  if (ligne == null) return null

  const { derniereModificationPar, ...lieu } = ligne

  return {
    lieu: lieuToDomain(lieu),
    ficheCoop: lieuCoopToDomain(lieu).fiche,
    derniereModificationCoop: lieu.modification,
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
