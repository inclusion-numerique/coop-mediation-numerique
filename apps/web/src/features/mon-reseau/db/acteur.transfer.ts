import {
  employeuseCodeInsee,
  personneConseillerNumeriqueSelect,
  personneEmployeuseSelect,
  personneEstConseillerNumerique,
  personneToEmployeuseActuelle,
} from '@app/web/features/employeuse/server'
import type { Prisma } from '@app/web/generated/prisma/client'
import {
  type CodeDepartement,
  CodeInsee,
  DEPARTEMENT_PAR_DEFAUT,
  departementDeLActeur,
} from '@app/web/libraries/departement'
import { nomAffiche } from '@app/web/libraries/nom-affiche'
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
} from '../domain'
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
  personneMain: { select: personneConseillerNumeriqueSelect },
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
                  personneMain: { select: personneEmployeuseSelect },
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

const departementDuCoordinateur = (
  personneMain: LigneCoordinateurDeLActeur['personneMain'],
): CodeDepartement => {
  const actuelle = personneToEmployeuseActuelle(personneMain)
  return (
    departementDeLActeur({
      employeuse: CodeInsee.safe(
        actuelle === null
          ? ''
          : (employeuseCodeInsee(actuelle.employeuse) ?? ''),
      ),
      lieux: [],
    }) ?? DEPARTEMENT_PAR_DEFAUT
  )
}

const versCoordinateurDeLActeur = (
  coordinateur: LigneCoordinateurDeLActeur,
): CoordinateurDeLActeur | null => {
  const acteurId = ActeurId.safe(coordinateur.id)
  return acteurId === null
    ? null
    : {
        acteurId,
        nomAffiche: nomAfficheDe(coordinateur),
        departement: departementDuCoordinateur(coordinateur.personneMain),
      }
}

const versMediation = (mediateur: LigneMediateur): Mediation | null => {
  const mediateurId = MediateurId.safe(mediateur.id)
  const nombreDeLieux = Effectif.safe(mediateur._count.enActivite)
  return mediateurId === null || nombreDeLieux === null
    ? null
    : {
        mediateurId,
        nombreDeLieux,
        coordinateurs: mediateur.coordinations
          .map(({ coordinateur }) =>
            versCoordinateurDeLActeur(coordinateur.user),
          )
          .filter((coordinateur) => coordinateur !== null),
      }
}

const versProfil = (ligne: LigneActeur): ProfilActeur | null => {
  const dispositif = dispositifDe(
    personneEstConseillerNumerique(ligne.personneMain),
  )
  const mediation =
    ligne.mediateur === null ? null : versMediation(ligne.mediateur)
  const coordinateurId =
    ligne.coordinateur === null
      ? null
      : CoordinateurId.safe(ligne.coordinateur.id)

  if (coordinateurId !== null) {
    return { _tag: 'Coordinateur', dispositif, coordinateurId, mediation }
  }

  return mediation === null
    ? null
    : { _tag: 'Mediateur', dispositif, mediation }
}

export const versActeur = (ligne: LigneActeur): Acteur | null => {
  const acteurId = ActeurId.safe(ligne.id)
  const courriel = Courriel.safe(ligne.email)
  const profil = versProfil(ligne)

  return acteurId === null || courriel === null || profil === null
    ? null
    : { acteurId, nomAffiche: nomAfficheDe(ligne), courriel, profil }
}
