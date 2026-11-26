import { prismaClient } from '@/configuration/prisma'
import { OrganisationId } from '../../../../domain/identifiants/organisation-id'
import { RdvId } from '../../../../domain/identifiants/rdv-id'
import { StatutPresence } from '../../../../domain/rdv/statut-presence'
import type { RdvEnUneLigne } from '../../domain/donnees-accueil-rdv'
import type { LireDonneesAccueilRdv } from '../../domain/ports'

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

  const aVenirCriteres = {
    rdvAccountId,
    status: 'unknown',
    startsAt: { gte: maintenant },
  } as const

  const honoreSansCompteRendu = {
    rdvAccountId,
    status: 'seen',
    activite: null,
    compteRenduRegle: false,
  } as const

  const [aVenir, prochain, passes, honores, dernier] = await Promise.all([
    prismaClient.rdv.count({ where: aVenirCriteres }),
    prismaClient.rdv.findFirst({
      where: aVenirCriteres,
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
