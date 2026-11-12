import { prismaClient } from '@app/web/prismaClient'
import {
  activiteDeMediationSelect,
  activiteDeMediationToDomain,
} from '../db/activite-de-mediation.transfer'
import {
  type ActiviteAModifier,
  type ActiviteId,
  AdresseDuLieu,
  BeneficiaireId,
  type BeneficiaireSuiviAffiche,
  Commune,
  LieuActiviteId,
  type MediateurId,
  NomDeFamille,
  NomDeStructure,
  NomDeTag,
  Prenom,
  TagId,
} from '../domain'

const adresseDu = (lieu: {
  readonly adresse: string | null
  readonly codePostal: string | null
  readonly commune: string | null
}): AdresseDuLieu | null =>
  lieu.adresse && lieu.codePostal && lieu.commune
    ? AdresseDuLieu(`${lieu.adresse}, ${lieu.codePostal} ${lieu.commune}`)
    : null

const residenceDu = ({
  commune,
  communeCodePostal,
  communeCodeInsee,
}: {
  readonly commune: string | null
  readonly communeCodePostal: string | null
  readonly communeCodeInsee: string | null
}): Commune | null =>
  Commune.safe({
    nom: commune ?? '',
    codePostal: communeCodePostal ?? '',
    codeInsee: communeCodeInsee ?? '',
  })

const suiviAffiche = (beneficiaire: {
  readonly id: string
  readonly prenom: string | null
  readonly nom: string | null
  readonly commune: string | null
  readonly communeCodePostal: string | null
  readonly communeCodeInsee: string | null
}): BeneficiaireSuiviAffiche => ({
  id: BeneficiaireId(beneficiaire.id),
  prenom: Prenom(beneficiaire.prenom ?? ''),
  nom: NomDeFamille(beneficiaire.nom ?? ''),
  residence: residenceDu(beneficiaire),
})

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
          beneficiaire: {
            select: {
              ...activiteDeMediationSelect.accompagnements.select.beneficiaire
                .select,
              prenom: true,
              nom: true,
            },
          },
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
              id: LieuActiviteId(ligne.lieuInclusion.id),
              nom: NomDeStructure(ligne.lieuInclusion.nom),
              adresse: adresseDu(ligne.lieuInclusion),
            },
      suivis: ligne.accompagnements
        .map(({ beneficiaire }) => beneficiaire)
        .filter(({ anonyme }) => !anonyme)
        .map(suiviAffiche),
      tags: ligne.tags.map(({ tag }) => ({
        id: TagId(tag.id),
        nom: NomDeTag(tag.nom),
      })),
    },
  }
}
