import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import {
  StatutPresence,
  type statutsPresence,
} from '../../../../domain/statut-presence'
import {
  type StatutRdv,
  statutRdv,
  type statutsRdv,
} from '../../../../domain/statut-rdv'

type Periode = { readonly du: Date; readonly au: Date }

const statutDe = (rdv: {
  readonly status: (typeof statutsPresence)[number]
  readonly endsAt: Date
}): StatutRdv => statutRdv(StatutPresence(rdv.status), rdv.endsAt, new Date())

export const rendezVousLies = async (ids: readonly number[]) =>
  ids.length === 0
    ? []
    : (
        await prismaClient.rdv.findMany({
          where: { id: { in: [...ids] } },
          select: { id: true, status: true, endsAt: true, urlForAgents: true },
        })
      ).map((rdv) => ({
        id: rdv.id,
        statut: statutDe(rdv),
        lienAgent: rdv.urlForAgents,
      }))

export const rendezVousParIds = async (ids: readonly number[]) =>
  ids.length === 0
    ? []
    : (
        await prismaClient.rdv.findMany({
          where: { id: { in: [...ids] } },
          select: {
            id: true,
            status: true,
            startsAt: true,
            endsAt: true,
            name: true,
            maxParticipantsCount: true,
            urlForAgents: true,
            motif: { select: { name: true, collectif: true } },
            participations: {
              select: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        })
      ).map((rdv) => ({
        id: rdv.id,
        statut: statutDe(rdv),
        lienAgent: rdv.urlForAgents,
        debut: rdv.startsAt,
        fin: rdv.endsAt,
        motif:
          rdv.motif === null
            ? null
            : { nom: rdv.motif.name, collectif: rdv.motif.collectif },
        titre: rdv.name,
        places: rdv.maxParticipantsCount,
        participants: rdv.participations.map(({ user }) => ({
          prenom: user.firstName,
          nom: user.lastName,
        })),
      }))

const CONDITION_DE_STATUT: Readonly<
  Record<(typeof statutsRdv)[number], Prisma.Sql>
> = {
  passe: Prisma.sql`(rdv.status = 'unknown' AND rdv.starts_at < NOW())`,
  unknown: Prisma.sql`(rdv.status = 'unknown' AND rdv.starts_at >= NOW())`,
  seen: Prisma.sql`rdv.status = 'seen'`,
  noshow: Prisma.sql`rdv.status = 'noshow'`,
  excused: Prisma.sql`rdv.status = 'excused'`,
  revoked: Prisma.sql`rdv.status = 'revoked'`,
}

const conditionDeStatut =
  <K extends string>(table: Readonly<Record<K, Prisma.Sql>>) =>
  (statut: K): Prisma.Sql =>
    table[statut]

export const rendezVousAListerSql = ({
  comptes,
  periode,
  statuts,
}: {
  readonly comptes: readonly number[]
  readonly periode: Periode | null
  readonly statuts: readonly (typeof statutsRdv)[number][]
}): Prisma.Sql =>
  Prisma.sql`SELECT rdv.id, rdv.starts_at AS moment, rdv.created_at AS creation
    FROM rdvs rdv
    WHERE rdv.rdv_account_id = ANY(${[...comptes]}::int[])
      AND rdv.cra_declined = FALSE
      ${periode === null ? Prisma.empty : Prisma.sql`AND rdv.starts_at::date BETWEEN ${periode.du}::date AND ${periode.au}::date`}
      ${statuts.length === 0 ? Prisma.empty : Prisma.sql`AND (${Prisma.join(statuts.map(conditionDeStatut(CONDITION_DE_STATUT)), ' OR ')})`}`
