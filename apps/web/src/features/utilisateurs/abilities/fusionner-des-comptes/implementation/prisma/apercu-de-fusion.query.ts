import { identiteToDomain } from '@app/web/features/utilisateurs/db/identite.transfer'
import {
  etatDuCompte,
  nomAffiche,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { type ApercuDeFusion, type CompteApercu, communs } from '../../domain'

const apercuSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  name: true,
  deleted: true,
  mutations: { select: { id: true } },
  personneMain: {
    select: {
      affectationsEmploi: {
        where: { estActive: true },
        select: { structureAdministrativeId: true },
      },
    },
  },
  mediateur: {
    select: {
      beneficiaires: { where: { suppression: null }, select: { id: true } },
      activites: { where: { suppression: null }, select: { id: true } },
      tags: { select: { id: true } },
      invitations: { select: { email: true, coordinateurId: true } },
      coordinations: {
        where: { suppression: null },
        select: { coordinateurId: true },
      },
      enActivite: {
        where: { suppression: null, fin: null },
        select: { structureId: true },
      },
    },
  },
  coordinateur: {
    select: {
      Tag: { select: { id: true } },
      invitations: { select: { email: true, coordinateurId: true } },
      mediateursCoordonnes: {
        where: { suppression: null },
        select: { mediateurId: true },
      },
    },
  },
} satisfies Prisma.UserSelect

type ApercuRow = Prisma.UserGetPayload<{ select: typeof apercuSelect }>

const invitation = ({
  email,
  coordinateurId,
}: {
  email: string
  coordinateurId: string
}) => `${email}-${coordinateurId}`

const versApercu = (row: ApercuRow): CompteApercu => {
  const identite = identiteToDomain(row)

  return {
    id: UtilisateurId(row.id),
    nom: nomAffiche(identite),
    courriel: identite.courriel,
    etat: etatDuCompte(row.deleted),
    contenu: {
      beneficiaires: row.mediateur?.beneficiaires.map(({ id }) => id) ?? [],
      activites: row.mediateur?.activites.map(({ id }) => id) ?? [],
      structuresEmployeuses:
        row.personneMain?.affectationsEmploi.map(
          ({ structureAdministrativeId }) => String(structureAdministrativeId),
        ) ?? [],
      lieuxActivite:
        row.mediateur?.enActivite.map(({ structureId }) => structureId) ?? [],
      equipesRejointes:
        row.mediateur?.coordinations.map(
          ({ coordinateurId }) => coordinateurId,
        ) ?? [],
      mediateursCoordonnes:
        row.coordinateur?.mediateursCoordonnes.map(
          ({ mediateurId }) => mediateurId,
        ) ?? [],
      invitationsRecues: row.mediateur?.invitations.map(invitation) ?? [],
      invitationsEnvoyees: row.coordinateur?.invitations.map(invitation) ?? [],
      mutations: row.mutations.map(({ id }) => id),
      tags: [
        ...(row.mediateur?.tags.map(({ id }) => id) ?? []),
        ...(row.coordinateur?.Tag.map(({ id }) => id) ?? []),
      ],
    },
  }
}

export const apercuDeFusion = async ({
  sourceId,
  cibleId,
}: {
  readonly sourceId: string
  readonly cibleId: string
}): Promise<ApercuDeFusion | null> => {
  const [source, cible] = await Promise.all([
    prismaClient.user.findUnique({
      where: { id: sourceId },
      select: apercuSelect,
    }),
    prismaClient.user.findUnique({
      where: { id: cibleId },
      select: apercuSelect,
    }),
  ])

  if (source === null || cible === null) return null

  const apercuSource = versApercu(source)
  const apercuCible = versApercu(cible)

  return {
    source: apercuSource,
    cible: apercuCible,
    communs: communs(apercuSource.contenu, apercuCible.contenu),
  }
}
