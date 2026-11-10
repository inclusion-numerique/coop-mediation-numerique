import type { Beneficiaire } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import {
  activiteDeMediationSelect,
  activiteDeMediationToDomain,
} from '../db/activite-de-mediation.transfer'
import type { ActiviteDeMediation, ActiviteId, MediateurId } from '../domain'

export type AffichageDeLActivite = {
  readonly lieu: {
    readonly id: string
    readonly nom: string
    readonly adresse: string | null
  } | null
  readonly suivis: readonly Beneficiaire[]
  readonly tags: readonly { readonly id: string; readonly nom: string }[]
}

export type ActiviteAModifier = {
  readonly activite: ActiviteDeMediation
  readonly affichage: AffichageDeLActivite
}

const adresseDu = (lieu: {
  readonly adresse: string | null
  readonly codePostal: string | null
  readonly commune: string | null
}): string | null =>
  lieu.adresse && lieu.codePostal && lieu.commune
    ? `${lieu.adresse}, ${lieu.codePostal} ${lieu.commune}`
    : null

export const lireUneActiviteDeMediation = async ({
  id,
  mediateurId,
}: {
  readonly id: ActiviteId
  readonly mediateurId: MediateurId
}): Promise<ActiviteAModifier | null> => {
  const ligne = await prismaClient.activite.findFirst({
    where: { id, mediateurId, suppression: null },
    select: {
      ...activiteDeMediationSelect,
      lieuInclusion: {
        select: {
          id: true,
          nom: true,
          adresse: true,
          codePostal: true,
          commune: true,
        },
      },
      accompagnements: {
        select: {
          ...activiteDeMediationSelect.accompagnements.select,
          beneficiaire: true,
        },
      },
      tags: {
        select: { tagId: true, tag: { select: { id: true, nom: true } } },
      },
    },
  })
  if (ligne === null) return null
  return {
    activite: activiteDeMediationToDomain(ligne),
    affichage: {
      lieu:
        ligne.lieuInclusion === null
          ? null
          : {
              id: ligne.lieuInclusion.id,
              nom: ligne.lieuInclusion.nom,
              adresse: adresseDu(ligne.lieuInclusion),
            },
      suivis: ligne.accompagnements
        .map(({ beneficiaire }) => beneficiaire)
        .filter(({ anonyme }) => !anonyme),
      tags: ligne.tags.map(({ tag }) => tag),
    },
  }
}
