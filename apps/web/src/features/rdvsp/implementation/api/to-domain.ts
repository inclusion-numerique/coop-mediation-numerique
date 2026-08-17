import { AdresseRdv } from '../../domain/adresse-rdv'
import type { Agent } from '../../domain/agent'
import {
  type DemandeRdvCreee,
  DemandeRdvId,
  UrlPriseRdv,
} from '../../domain/demande-rdv'
import { DureeEnMinutes } from '../../domain/duree-en-minutes'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../domain/identite'
import {
  JetonAcces,
  JetonRafraichissement,
  type JetonsOAuth,
  PorteeOAuth,
} from '../../domain/jetons-oauth'
import { NomAtelier, NomMotif, NomOrganisation } from '../../domain/libelle'
import { type Lieu, LieuId, NomLieu } from '../../domain/lieu'
import { CategorieMotifId, type Motif } from '../../domain/motif'
import { MotifId } from '../../domain/motif-id'
import { NombreParticipantsMax } from '../../domain/nombre-participants-max'
import type { Organisation } from '../../domain/organisation'
import { OrganisationId } from '../../domain/organisation-id'
import type { Participation } from '../../domain/participation'
import { ParticipationId } from '../../domain/participation-id'
import type { Rdv } from '../../domain/rdv'
import { RdvAgentId } from '../../domain/rdv-agent-id'
import { RdvId } from '../../domain/rdv-id'
import { RdvUuid } from '../../domain/rdv-uuid'
import { StatutPresence } from '../../domain/statut-presence'
import { UrlAgent } from '../../domain/url-agent'
import type { Usager } from '../../domain/usager'
import { UsagerId } from '../../domain/usager-id'
import type {
  AgentPayload,
  DemandeRdvPayload,
  JetonsPayload,
  OrganisationPayload,
  ParticipationPayload,
  RdvPayload,
  UsagerPayload,
} from './payloads'

/**
 * Les données d'identité que RDV Service Public transmet sont saisies par des
 * agents : `Model.safe` les ramène à l'absence plutôt que de faire échouer tout
 * un lot sur un téléphone ou un e-mail mal formé. Les invariants structurels —
 * identifiants, dates, URL — restent stricts : leur violation signale une
 * évolution d'API, pas une coquille de saisie.
 */

export const agentToDomain = (payload: AgentPayload): Agent => ({
  id: RdvAgentId(payload.id),
  email: EmailExterne(payload.email),
  prenom: PrenomExterne(payload.first_name),
  nom: NomExterne(payload.last_name),
})

export const organisationToDomain = (
  payload: OrganisationPayload,
): Organisation => ({
  id: OrganisationId(payload.id),
  nom: NomOrganisation(payload.name),
  email: payload.email === null ? null : EmailExterne.safe(payload.email),
  telephone:
    payload.phone_number === null
      ? null
      : TelephoneExterne.safe(payload.phone_number),
  verticale: payload.verticale,
})

export const usagerToDomain = (payload: UsagerPayload): Usager => ({
  id: UsagerId(payload.id),
  prenom: PrenomExterne(payload.first_name),
  nom: NomExterne(payload.last_name),
  email: payload.email === null ? null : EmailExterne.safe(payload.email),
  telephone:
    payload.phone_number === null
      ? null
      : TelephoneExterne.safe(payload.phone_number),
  telephoneFormate:
    payload.phone_number_formatted === null
      ? null
      : TelephoneExterne.safe(payload.phone_number_formatted),
  dateNaissance: payload.birth_date,
  creation: payload.created_at,
  invitationCreee: payload.invitation_created_at,
  invitationAcceptee: payload.invitation_accepted_at,
  coordonnees: {
    adresse: payload.address,
    complementAdresse: payload.address_details,
    numeroAllocataire: payload.affiliation_number,
    caisseAffiliation: payload.caisse_affiliation,
    nomNaissance: payload.birth_name,
  },
  responsableId:
    payload.responsible_id === null ? null : UsagerId(payload.responsible_id),
  notifierParEmail: payload.notify_by_email,
  notifierParSms: payload.notify_by_sms,
})

export const participationToDomain = (
  payload: ParticipationPayload,
): Participation => ({
  id: ParticipationId(payload.id),
  usagerId: UsagerId(payload.user.id),
  usager: usagerToDomain(payload.user),
  statutPresence: StatutPresence(payload.status),
  notificationRappel: payload.send_reminder_notification,
  notificationsCycleDeVie: payload.send_lifecycle_notifications,
})

const motifToDomain = (payload: RdvPayload['motif']): Motif | null =>
  payload === null
    ? null
    : {
        id: MotifId(payload.id),
        nom: NomMotif(payload.name),
        collectif: payload.collectif,
        organisationId: OrganisationId(payload.organisation_id),
        suivi: payload.follow_up,
        instruction: payload.instruction_for_rdv,
        typeDeLieu: payload.location_type,
        categorieId:
          payload.motif_category === null
            ? null
            : CategorieMotifId(payload.motif_category.id),
      }

const lieuToDomain = (payload: RdvPayload['lieu']): Lieu | null =>
  payload === null
    ? null
    : {
        id: LieuId(payload.id),
        nom: NomLieu(payload.name),
        adresse:
          payload.address === null ? null : AdresseRdv.safe(payload.address),
        organisationId: OrganisationId(payload.organisation_id),
        telephone:
          payload.phone_number === null
            ? null
            : TelephoneExterne.safe(payload.phone_number),
        usageUnique: payload.single_use,
      }

export const rdvToDomain = (payload: RdvPayload, agentId: RdvAgentId): Rdv => {
  const base = {
    id: RdvId(payload.id),
    uuid: RdvUuid(payload.uuid),
    agentId,
    organisationId: OrganisationId(payload.organisation.id),
    adresse: payload.address === null ? null : AdresseRdv.safe(payload.address),
    debut: payload.starts_at,
    fin: payload.ends_at,
    duree: DureeEnMinutes(payload.duration_in_min),
    statutPresence: StatutPresence(payload.status),
    urlAgent: UrlAgent(payload.url_for_agents),
    nombreParticipants: payload.users_count,
    contexte: payload.context,
    creeParId: payload.created_by_id,
    annulation: payload.cancelled_at,
    motif: motifToDomain(payload.motif),
    lieu: lieuToDomain(payload.lieu),
    participations: payload.participations.map(participationToDomain),
  }

  if (!payload.collectif) {
    return { ...base, collectif: false }
  }

  return {
    ...base,
    collectif: true,
    nom: payload.name === null ? null : NomAtelier.safe(payload.name),
    participantsMax:
      payload.max_participants_count === null
        ? null
        : NombreParticipantsMax.safe(payload.max_participants_count),
  }
}

export const demandeRdvToDomain = (
  payload: DemandeRdvPayload,
): DemandeRdvCreee => ({
  id: DemandeRdvId(payload.rdv_plan.id),
  usagerId: UsagerId(payload.rdv_plan.user_id),
  url: UrlPriseRdv(payload.rdv_plan.url),
  rdvId: payload.rdv_plan.rdv === null ? null : RdvId(payload.rdv_plan.rdv.id),
})

/**
 * RDV Service Public ne renvoie pas systématiquement un nouveau jeton de
 * rafraîchissement ni la portée : on conserve alors ceux du compte, sans quoi un
 * renouvellement réussi dégraderait silencieusement le compte.
 */
export const jetonsToDomain = (
  payload: JetonsPayload,
  precedents: JetonsOAuth,
  maintenant: Date,
): JetonsOAuth => ({
  acces: JetonAcces(payload.access_token),
  rafraichissement:
    payload.refresh_token === null
      ? precedents.rafraichissement
      : JetonRafraichissement(payload.refresh_token),
  expiration: new Date(maintenant.getTime() + payload.expires_in * 1000),
  portee:
    payload.scope === null ? precedents.portee : PorteeOAuth(payload.scope),
})
