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
import { MediateurId } from '../../../../domain/mediateur-id'
import { RattachementId } from '../../../../domain/rattachement-id'
import { UserId } from '../../../../domain/user-id'
import {
  type CoordinateurDuMediateur,
  Courriel,
  type DerniereActiviteIci,
  type MediateurDuLieu,
  NombreDeLieux,
  profilDuMediateur,
} from '../../domain'

const identiteSelect = {
  id: true,
  firstName: true,
  lastName: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect

export const mediateurDuLieuSelect = (lieuId: string) =>
  ({
    id: true,
    mediateur: {
      select: {
        id: true,
        user: {
          select: {
            ...identiteSelect,
            personneMain: { select: personneConseillerNumeriqueSelect },
            coordinateur: { select: { id: true } },
          },
        },
        coordinations: {
          where: { suppression: null },
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
        activites: {
          take: 1,
          orderBy: { date: 'desc' },
          where: { structureId: lieuId, suppression: null },
          select: { date: true },
        },
      },
    },
  }) satisfies Prisma.MediateurEnActiviteSelect

export type LigneMediateurDuLieu = Prisma.MediateurEnActiviteGetPayload<{
  select: ReturnType<typeof mediateurDuLieuSelect>
}>

type LigneCoordinateur =
  LigneMediateurDuLieu['mediateur']['coordinations'][number]['coordinateur']['user']

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
  personneMain: LigneCoordinateur['personneMain'],
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

const versCoordinateur = (
  coordinateur: LigneCoordinateur,
): CoordinateurDuMediateur | null => {
  const acteurId = UserId.safe(coordinateur.id)
  return acteurId === null
    ? null
    : {
        acteurId,
        nomAffiche: nomAfficheDe(coordinateur),
        departement: departementDuCoordinateur(coordinateur.personneMain),
      }
}

const derniereActiviteIci = (
  activites: LigneMediateurDuLieu['mediateur']['activites'],
): DerniereActiviteIci => {
  const derniere = activites.at(0)
  return derniere === undefined
    ? { _tag: 'Jamais' }
    : { _tag: 'Le', date: derniere.date }
}

export const versMediateurDuLieu = ({
  id,
  mediateur,
}: LigneMediateurDuLieu): MediateurDuLieu | null => {
  const rattachementId = RattachementId.safe(id)
  const mediateurId = MediateurId.safe(mediateur.id)
  const acteurId = UserId.safe(mediateur.user.id)
  const courriel = Courriel.safe(mediateur.user.email)
  const nombreDeLieux = NombreDeLieux.safe(mediateur._count.enActivite)

  return rattachementId === null ||
    mediateurId === null ||
    acteurId === null ||
    courriel === null ||
    nombreDeLieux === null
    ? null
    : {
        rattachementId,
        mediateurId,
        acteurId,
        nomAffiche: nomAfficheDe(mediateur.user),
        courriel,
        profil: profilDuMediateur({
          estCoordinateur: mediateur.user.coordinateur !== null,
          estConseillerNumerique: personneEstConseillerNumerique(
            mediateur.user.personneMain,
          ),
        }),
        nombreDeLieux,
        coordinateurs: mediateur.coordinations
          .map(({ coordinateur }) => versCoordinateur(coordinateur.user))
          .filter((coordinateur) => coordinateur !== null),
        derniereActiviteIci: derniereActiviteIci(mediateur.activites),
      }
}
