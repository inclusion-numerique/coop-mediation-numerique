import type { Prisma } from '@app/web/generated/prisma/client'
import {
  type ActiviteConsultee,
  AdresseDuLieu,
  BeneficiaireId,
  type BeneficiaireSuiviAffiche,
  Commune,
  Effectif,
  LieuActiviteId,
  NomDeFamille,
  NomDeStructure,
  NomDeTag,
  Prenom,
  TagId,
} from '../domain'
import {
  activiteDeMediationSelect,
  activiteDeMediationToDomain,
  residenceDe,
} from './activite-de-mediation.transfer'
import {
  type RendezVousLieFourni,
  rendezVousAffiche,
} from './rendez-vous-fournis'

export const activiteConsulteeSelect = {
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
          accompagnementsCount: true,
        },
      },
    },
  },
  tags: {
    select: { tagId: true, tag: { select: { id: true, nom: true } } },
  },
} satisfies Prisma.ActiviteSelect

export type ActiviteConsulteeRow = Prisma.ActiviteGetPayload<{
  select: typeof activiteConsulteeSelect
}>

const adresseDu = (lieu: {
  readonly adresse: string | null
  readonly codePostal: string | null
  readonly commune: string | null
}): AdresseDuLieu | null =>
  lieu.adresse && lieu.codePostal && lieu.commune
    ? AdresseDuLieu(`${lieu.adresse}, ${lieu.codePostal} ${lieu.commune}`)
    : null

const localiteDu = (lieu: {
  readonly codePostal: string | null
  readonly commune: string | null
}): AdresseDuLieu | null =>
  AdresseDuLieu.safe([lieu.codePostal, lieu.commune].filter(Boolean).join(' '))

const residenceDu = ({
  commune,
  communeCodePostal,
  communeCodeInsee,
}: {
  readonly commune: string | null
  readonly communeCodePostal: string | null
  readonly communeCodeInsee: string | null
}): Commune | null =>
  residenceDe({
    nom: commune,
    codePostal: communeCodePostal,
    codeInsee: communeCodeInsee,
  })

const suiviAffiche = (beneficiaire: {
  readonly id: string
  readonly prenom: string | null
  readonly nom: string | null
  readonly commune: string | null
  readonly communeCodePostal: string | null
  readonly communeCodeInsee: string | null
  readonly accompagnementsCount: number
}): BeneficiaireSuiviAffiche => ({
  id: BeneficiaireId(beneficiaire.id),
  prenom: Prenom(beneficiaire.prenom ?? ''),
  nom: NomDeFamille(beneficiaire.nom ?? ''),
  residence: residenceDu(beneficiaire),
  nombreDActivites: Effectif(beneficiaire.accompagnementsCount),
})

export const activiteConsulteeDe = (
  ligne: ActiviteConsulteeRow,
  rendezVousLies: readonly RendezVousLieFourni[],
): ActiviteConsultee => {
  const activite = activiteDeMediationToDomain(ligne)
  const { origine } = activite
  const lie =
    origine._tag === 'RendezVous'
      ? rendezVousLies.find(({ id }) => id === origine.rdvId)
      : undefined
  return {
    activite,
    affichage: {
      lieu:
        ligne.lieuInclusion === null
          ? null
          : {
              id: LieuActiviteId(ligne.lieuInclusion.id),
              nom: NomDeStructure(ligne.lieuInclusion.nom),
              adresse: adresseDu(ligne.lieuInclusion),
              localite: localiteDu(ligne.lieuInclusion),
            },
      suivis: ligne.accompagnements
        .map(({ beneficiaire }) => beneficiaire)
        .filter(({ anonyme }) => !anonyme)
        .map(suiviAffiche),
      tags: ligne.tags.map(({ tag }) => ({
        id: TagId(tag.id),
        nom: NomDeTag(tag.nom),
      })),
      rendezVous: lie === undefined ? null : rendezVousAffiche(lie),
    },
  }
}

export const rdvIdsDes = (
  lignes: readonly ActiviteConsulteeRow[],
): readonly number[] =>
  lignes.flatMap(({ rdvId }) => (rdvId === null ? [] : [rdvId]))
