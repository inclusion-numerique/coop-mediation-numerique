import { prismaClient } from '@app/web/prismaClient'
import { OrganisationId } from '../../../../domain/organisation-id'
import { RdvId } from '../../../../domain/rdv-id'
import { StatutPresence } from '../../../../domain/statut-presence'
import type { LireDonneesAccueilRdv } from '../../domain/consulter-rdvs-accueil'
import type { RdvEnUneLigne } from '../../domain/donnees-accueil-rdv'

const selectionRdv = {
  id: true,
  startsAt: true,
  endsAt: true,
  collectif: true,
  usersCount: true,
  status: true,
  participations: {
    select: { user: { select: { firstName: true, lastName: true } } },
    take: 1,
  },
} as const

type LigneRdv = {
  id: number
  startsAt: Date
  endsAt: Date
  collectif: boolean
  usersCount: number
  status: 'unknown' | 'seen' | 'excused' | 'revoked' | 'noshow'
  participations: { user: { firstName: string; lastName: string } }[]
}

const premierParticipant = (participations: LigneRdv['participations']) => {
  const usager = participations.at(0)?.user

  return usager === undefined
    ? null
    : { prenom: usager.firstName, nom: usager.lastName }
}

const toRdvEnUneLigne = (row: LigneRdv): RdvEnUneLigne => ({
  id: RdvId(row.id),
  debut: row.startsAt,
  fin: row.endsAt,
  collectif: row.collectif,
  nombreParticipants: row.usersCount,
  premierParticipant: premierParticipant(row.participations),
  statutPresence: StatutPresence(row.status),
})

/**
 * Quatre lectures indépendantes, lancées ensemble. Les compteurs et les deux
 * rendez-vous mis en avant partagent les mêmes critères que les listes vers
 * lesquelles l'accueil renvoie — un rendez-vous « à venir » commence après
 * l'instant courant, un « passé » est échu sans présence saisie.
 */
export const lireDonneesAccueilRdv: LireDonneesAccueilRdv = async ({
  compte,
  maintenant,
}) => {
  const rdvAccountId = compte.agentId

  const echuSansPresence = {
    rdvAccountId,
    status: 'unknown',
    endsAt: { lte: maintenant },
  } as const

  const honoreSansCompteRendu = {
    rdvAccountId,
    status: 'seen',
    activite: null,
    craDeclined: false,
  } as const

  const [aVenir, prochain, passes, honores, dernier] = await Promise.all([
    prismaClient.rdv.count({
      where: { rdvAccountId, startsAt: { gte: maintenant } },
    }),
    prismaClient.rdv.findFirst({
      where: { rdvAccountId, startsAt: { gte: maintenant } },
      select: selectionRdv,
      orderBy: { startsAt: 'asc' },
    }),
    prismaClient.rdv.count({ where: echuSansPresence }),
    prismaClient.rdv.count({ where: honoreSansCompteRendu }),
    prismaClient.rdv.findFirst({
      where: { OR: [echuSansPresence, honoreSansCompteRendu] },
      select: selectionRdv,
      orderBy: { startsAt: 'desc' },
    }),
  ])

  const organisationId = compte.organisationIds.at(0) ?? null

  const organisation =
    organisationId === null
      ? null
      : await prismaClient.rdvOrganisation.findUnique({
          where: { id: organisationId },
          select: { id: true, name: true },
        })

  return {
    aVenir,
    prochain: prochain === null ? null : toRdvEnUneLigne(prochain),
    passes,
    honores,
    dernier: dernier === null ? null : toRdvEnUneLigne(dernier),
    organisationPrincipale:
      organisation === null
        ? null
        : { id: OrganisationId(organisation.id), nom: organisation.name },
  }
}
