import type {
  Rdv as PrismaRdv,
  RdvLieu as PrismaRdvLieu,
  RdvMotif as PrismaRdvMotif,
  RdvParticipation as PrismaRdvParticipation,
  RdvUser as PrismaRdvUser,
} from '@prisma/client'
import { AdresseRdv } from '../domain/adresse-rdv'
import { DureeEnMinutes } from '../domain/duree-en-minutes'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../domain/identite'
import { NomAtelier, NomMotif } from '../domain/libelle'
import { type Lieu, LieuId, NomLieu } from '../domain/lieu'
import { CategorieMotifId, type Motif } from '../domain/motif'
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
import type { Usager } from '../domain/usager'
import { UsagerId } from '../domain/usager-id'
import { absentSiVide } from './vide'

/**
 * Le rendez-vous et son entourage : motif, lieu et participants sont des
 * relations que la lecture doit inclure, la synchronisation les persistant
 * ensemble.
 */
export type RdvRow = PrismaRdv & {
  motif: PrismaRdvMotif | null
  lieu: PrismaRdvLieu | null
  participations: readonly (PrismaRdvParticipation & {
    user: PrismaRdvUser
  })[]
}

export const participationToDomain = (
  row: PrismaRdvParticipation & { user: PrismaRdvUser },
): Participation => ({
  id: ParticipationId(row.id),
  usagerId: UsagerId(row.userId),
  usager: usagerToDomain(row.user),
  statutPresence: StatutPresence(row.status),
  notificationRappel: row.sendReminderNotification,
  notificationsCycleDeVie: row.sendLifecycleNotifications,
})

const toMotif = (motif: RdvRow['motif']): Motif | null =>
  motif === null
    ? null
    : {
        id: MotifId(motif.id),
        nom: NomMotif(motif.name),
        collectif: motif.collectif,
        organisationId: OrganisationId(motif.organisationId),
        suivi: motif.followUp,
        instruction: motif.instructionForRdv,
        typeDeLieu: motif.locationType,
        categorieId:
          motif.motifCategoryId === null
            ? null
            : CategorieMotifId(motif.motifCategoryId),
      }

const toLieu = (lieu: RdvRow['lieu']): Lieu | null => {
  if (lieu === null) {
    return null
  }

  const adresse = absentSiVide(lieu.address)
  const telephone = absentSiVide(lieu.phoneNumber)

  return {
    id: LieuId(lieu.id),
    nom: NomLieu(lieu.name),
    adresse: adresse === null ? null : AdresseRdv(adresse),
    organisationId: OrganisationId(lieu.organisationId),
    telephone: telephone === null ? null : TelephoneExterne(telephone),
    usageUnique: lieu.singleUse,
  }
}

/**
 * Les usagers viennent de `rdv_users`, alimentée par RDV Service Public : les
 * identités passent par `Model.safe`, une donnée héritée mal formée ne devant pas
 * empêcher de lire un rendez-vous.
 */
const usagerToDomain = (row: PrismaRdvUser): Usager => ({
  id: UsagerId(row.id),
  prenom: PrenomExterne(row.firstName),
  nom: NomExterne(row.lastName),
  email: row.email === null ? null : EmailExterne.safe(row.email),
  telephone:
    row.phoneNumberFormatted === null && row.phoneNumber === null
      ? null
      : TelephoneExterne.safe(
          row.phoneNumberFormatted ?? row.phoneNumber ?? '',
        ),
  dateNaissance: row.birthDate,
  coordonnees: {
    adresse: row.address,
    complementAdresse: row.addressDetails,
    numeroAllocataire: row.affiliationNumber,
    caisseAffiliation: row.caisseAffiliation,
    nomNaissance: row.birthName,
  },
  responsableId:
    row.responsibleId === null ? null : UsagerId(row.responsibleId),
  notifierParEmail: row.notifyByEmail,
  notifierParSms: row.notifyBySms,
})

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
    nombreParticipants: row.usersCount,
    contexte: row.context,
    creeParId: row.createdById,
    annulation: row.cancelledAt,
    motif: toMotif(row.motif),
    lieu: toLieu(row.lieu),
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
  usersCount: rdv.nombreParticipants,
  context: rdv.contexte,
  createdById: rdv.creeParId,
  cancelledAt: rdv.annulation,
  motifId: rdv.motif === null ? null : rdv.motif.id,
  lieuId: rdv.lieu === null ? null : rdv.lieu.id,
  collectif: rdv.collectif,
  name: rdv.collectif ? rdv.nom : null,
  maxParticipantsCount: rdv.collectif ? rdv.participantsMax : null,
})
