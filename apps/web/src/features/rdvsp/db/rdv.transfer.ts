import type {
  Rdv as PrismaRdv,
  RdvParticipation as PrismaRdvParticipation,
} from '@prisma/client'
import { AdresseRdv } from '../domain/adresse-rdv'
import { DureeEnMinutes } from '../domain/duree-en-minutes'
import { NomAtelier, NomMotif } from '../domain/libelle'
import type { Motif } from '../domain/motif'
import { MotifId } from '../domain/motif-id'
import { NombreParticipantsMax } from '../domain/nombre-participants-max'
import { OrganisationId } from '../domain/organisation-id'
import type { Participation } from '../domain/participation'
import { ParticipationId } from '../domain/participation-id'
import type { Rdv } from '../domain/rdv'
import { RdvAgentId } from '../domain/rdv-agent-id'
import { RdvId } from '../domain/rdv-id'
import { RdvUuid } from '../domain/rdv-uuid'
import { StatutPresence } from '../domain/statut-presence'
import { UrlAgent } from '../domain/url-agent'
import { UsagerId } from '../domain/usager-id'
import { absentSiVide } from './vide'

/**
 * Le motif est une relation : seul son libellé nous intéresse, le reste de son
 * paramétrage appartient à RDV Service Public.
 */
export type RdvRow = PrismaRdv & {
  motif: { id: number; name: string } | null
  participations: readonly PrismaRdvParticipation[]
}

export const participationToDomain = (
  row: PrismaRdvParticipation,
): Participation => ({
  id: ParticipationId(row.id),
  usagerId: UsagerId(row.userId),
  statutPresence: StatutPresence(row.status),
  notificationRappel: row.sendReminderNotification,
  notificationsCycleDeVie: row.sendLifecycleNotifications,
})

const toMotif = (motif: RdvRow['motif']): Motif | null =>
  motif === null ? null : { id: MotifId(motif.id), nom: NomMotif(motif.name) }

const toBase = (row: RdvRow) => {
  const adresse = absentSiVide(row.address)

  return {
    id: RdvId(row.id),
    uuid: RdvUuid(row.uuid),
    agentId: RdvAgentId(row.rdvAccountId),
    organisationId: OrganisationId(row.organisationId),
    adresse: adresse === null ? null : AdresseRdv(adresse),
    debut: row.startsAt,
    fin: row.endsAt,
    duree: DureeEnMinutes(row.durationInMin),
    statutPresence: StatutPresence(row.status),
    urlAgent: UrlAgent(row.urlForAgents),
    annulation: row.cancelledAt,
    motif: toMotif(row.motif),
    participations: row.participations.map(participationToDomain),
  }
}

/**
 * Le drapeau `collectif` de la ligne choisit la branche : c'est lui que porte la
 * table `rdvs`, et non celui du motif, qui peut être absent.
 */
export const rdvToDomain = (row: RdvRow): Rdv => {
  const base = toBase(row)

  if (!row.collectif) {
    return { ...base, collectif: false }
  }

  const nom = absentSiVide(row.name)

  return {
    ...base,
    collectif: true,
    nom: nom === null ? null : NomAtelier(nom),
    participantsMax:
      row.maxParticipantsCount === null
        ? null
        : NombreParticipantsMax(row.maxParticipantsCount),
  }
}

export const participationFromDomain = (participation: Participation) => ({
  id: participation.id,
  userId: participation.usagerId,
  status: participation.statutPresence,
  sendReminderNotification: participation.notificationRappel,
  sendLifecycleNotifications: participation.notificationsCycleDeVie,
})

/**
 * Rend les colonnes scalaires de `rdvs`. `raw_data` en est absent
 * volontairement : le payload brut de RDV Service Public reste stocké tel quel
 * et n'entre jamais dans le domaine — l'appelant le conserve ou le remplace
 * séparément, selon qu'il rejoue une synchronisation ou une simple mise à jour.
 */
export const rdvFromDomain = (rdv: Rdv) => ({
  id: rdv.id,
  uuid: rdv.uuid,
  rdvAccountId: rdv.agentId,
  organisationId: rdv.organisationId,
  address: rdv.adresse ?? '',
  startsAt: rdv.debut,
  endsAt: rdv.fin,
  durationInMin: rdv.duree,
  status: rdv.statutPresence,
  urlForAgents: rdv.urlAgent,
  cancelledAt: rdv.annulation,
  motifId: rdv.motif === null ? null : rdv.motif.id,
  collectif: rdv.collectif,
  name: rdv.collectif ? rdv.nom : null,
  maxParticipantsCount: rdv.collectif ? rdv.participantsMax : null,
})
