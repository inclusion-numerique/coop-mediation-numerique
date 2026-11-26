import type {
  Rdv as PrismaRdv,
  RdvLieu as PrismaRdvLieu,
  RdvMotif as PrismaRdvMotif,
  RdvParticipation as PrismaRdvParticipation,
  RdvUser as PrismaRdvUser,
} from '@/generated/prisma/client'
import { MotifId } from '../../domain/identifiants/motif-id'
import { OrganisationId } from '../../domain/identifiants/organisation-id'
import { ParticipationId } from '../../domain/identifiants/participation-id'
import { RdvAgentId } from '../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../domain/identifiants/rdv-id'
import { RdvUuid } from '../../domain/identifiants/rdv-uuid'
import { UsagerId } from '../../domain/identifiants/usager-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../domain/identite'
import { NomAtelier, NomMotif } from '../../domain/libelle'
import { AdresseRdv } from '../../domain/rdv/adresse-rdv'
import { DureeEnMinutes } from '../../domain/rdv/duree-en-minutes'
import { type Lieu, LieuId, NomLieu } from '../../domain/rdv/lieu'
import { CategorieMotifId, type Motif } from '../../domain/rdv/motif'
import { NombreParticipantsMax } from '../../domain/rdv/nombre-participants-max'
import type { Participation } from '../../domain/rdv/participation'
import type { Rdv } from '../../domain/rdv/rdv'
import { StatutPresence } from '../../domain/rdv/statut-presence'
import { UrlAgent } from '../../domain/url-agent'
import type { Usager } from '../../domain/usager'
import { absentSiVide } from './vide.transfer'

export type RdvRow = PrismaRdv & {
  motif: PrismaRdvMotif | null
  lieu: PrismaRdvLieu | null
  participations: readonly (PrismaRdvParticipation & {
    user: PrismaRdvUser
  })[]
}

const participationToDomain = (
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

const usagerToDomain = (row: PrismaRdvUser): Usager => ({
  id: UsagerId(row.id),
  prenom: PrenomExterne(row.firstName),
  nom: NomExterne(row.lastName),
  email: row.email === null ? null : EmailExterne.safe(row.email),
  telephone:
    row.phoneNumber === null ? null : TelephoneExterne.safe(row.phoneNumber),
  telephoneFormate:
    row.phoneNumberFormatted === null
      ? null
      : TelephoneExterne.safe(row.phoneNumberFormatted),
  dateNaissance: row.birthDate,
  creation: row.createdAt,
  invitationCreee: row.invitationCreatedAt,
  invitationAcceptee: row.invitationAcceptedAt,
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
