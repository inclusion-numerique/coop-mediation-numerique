import type { Prisma } from '@/generated/prisma/client'
import { CodeInsee } from '@/libraries/insee'
import { nomAffiche } from '@/libraries/nom-affiche'
import {
  type Acteur,
  ActeurId,
  type CoordinateurDeLActeur,
  CoordinateurId,
  Courriel,
  dispositifDe,
  Effectif,
  MediateurId,
  type Mediation,
  type ProfilActeur,
} from '../../domain'
import { acteurVisibleWhere } from './acteur.sql'

const identiteSelect = {
  id: true,
  firstName: true,
  lastName: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect

export const acteurSelect = {
  ...identiteSelect,
  personneMain: {
    select: { conseillerNumeriqueEnPoste: { select: { personneId: true } } },
  },
  coordinateur: { select: { id: true } },
  mediateur: {
    select: {
      id: true,
      coordinations: {
        where: {
          suppression: null,
          coordinateur: { user: acteurVisibleWhere },
        },
        select: {
          coordinateur: {
            select: {
              user: {
                select: {
                  ...identiteSelect,
                  personneMain: {
                    select: {
                      employeuseActuelle: { select: { codeInsee: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      _count: {
        select: { enActivite: { where: { suppression: null, fin: null } } },
      },
    },
  },
} satisfies Prisma.UserSelect

export type LigneActeur = Prisma.UserGetPayload<{ select: typeof acteurSelect }>

type LigneMediateur = NonNullable<LigneActeur['mediateur']>

type LigneCoordinateurDeLActeur =
  LigneMediateur['coordinations'][number]['coordinateur']['user']

const nomAfficheDe = ({
  firstName,
  lastName,
  name,
  email,
}: {
  firstName: string | null
  lastName: string | null
  name: string | null
  email: string
}) =>
  nomAffiche({
    prenom: firstName,
    nom: lastName,
    nomComplet: name,
    courriel: email,
  })

const communeDeLEmployeuse = (
  personneMain: LigneCoordinateurDeLActeur['personneMain'],
): CodeInsee | null => {
  const codeInsee = personneMain?.employeuseActuelle?.codeInsee ?? null
  return codeInsee === null ? null : CodeInsee(codeInsee)
}

const versCoordinateurDeLActeur = (
  coordinateur: LigneCoordinateurDeLActeur,
): CoordinateurDeLActeur => ({
  acteurId: ActeurId(coordinateur.id),
  nomAffiche: nomAfficheDe(coordinateur),
  communeDeLEmployeuse: communeDeLEmployeuse(coordinateur.personneMain),
})

const versMediation = (mediateur: LigneMediateur): Mediation => ({
  mediateurId: MediateurId(mediateur.id),
  nombreDeLieux: Effectif(mediateur._count.enActivite),
  coordinateurs: mediateur.coordinations.map(({ coordinateur }) =>
    versCoordinateurDeLActeur(coordinateur.user),
  ),
})

const versProfil = (ligne: LigneActeur): ProfilActeur | null => {
  const dispositif = dispositifDe(
    ligne.personneMain?.conseillerNumeriqueEnPoste != null,
  )
  const mediation =
    ligne.mediateur === null ? null : versMediation(ligne.mediateur)
  if (ligne.coordinateur !== null) {
    return {
      _tag: 'Coordinateur',
      dispositif,
      coordinateurId: CoordinateurId(ligne.coordinateur.id),
      mediation,
    }
  }

  return mediation === null
    ? null
    : { _tag: 'Mediateur', dispositif, mediation }
}

export const versActeur = (ligne: LigneActeur): Acteur | null => {
  const profil = versProfil(ligne)

  return profil === null
    ? null
    : {
        acteurId: ActeurId(ligne.id),
        nomAffiche: nomAfficheDe(ligne),
        courriel: Courriel(ligne.email),
        profil,
      }
}
