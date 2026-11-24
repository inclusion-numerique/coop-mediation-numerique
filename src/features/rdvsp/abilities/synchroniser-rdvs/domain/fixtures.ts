import { MotifId } from '../../../domain/identifiants/motif-id'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { ParticipationId } from '../../../domain/identifiants/participation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../domain/identifiants/rdv-id'
import { RdvUuid } from '../../../domain/identifiants/rdv-uuid'
import { UsagerId } from '../../../domain/identifiants/usager-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
} from '../../../domain/identite'
import { NomMotif } from '../../../domain/libelle'
import { AdresseRdv } from '../../../domain/rdv/adresse-rdv'
import { DureeEnMinutes } from '../../../domain/rdv/duree-en-minutes'
import { type Lieu, LieuId, NomLieu } from '../../../domain/rdv/lieu'
import type { Motif } from '../../../domain/rdv/motif'
import type { Participation } from '../../../domain/rdv/participation'
import type { Rdv } from '../../../domain/rdv/rdv'
import { StatutPresence } from '../../../domain/rdv/statut-presence'
import { UrlAgent } from '../../../domain/url-agent'
import type { Usager } from '../../../domain/usager'

/**
 * Fixtures partagées entre les tests de cette ability. Elles passent par les
 * smart constructors, jamais par un transtypage (TS-3), et n'existent qu'ici
 * pour que chaque test ne décrive que ce qu'il éprouve.
 */
export const usagerFixture = (
  id: number,
  surcharge: Partial<Usager> = {},
): Usager => ({
  id: UsagerId(id),
  prenom: PrenomExterne('Jean'),
  nom: NomExterne('Dupont'),
  email: EmailExterne('jean.dupont@example.com'),
  telephone: null,
  telephoneFormate: null,
  creation: null,
  invitationCreee: null,
  invitationAcceptee: null,
  dateNaissance: null,
  coordonnees: {
    adresse: null,
    complementAdresse: null,
    numeroAllocataire: null,
    caisseAffiliation: null,
    nomNaissance: null,
  },
  responsableId: null,
  notifierParEmail: false,
  notifierParSms: false,
  ...surcharge,
})

export const motifFixture = (
  id: number,
  surcharge: Partial<Motif> = {},
): Motif => ({
  id: MotifId(id),
  nom: NomMotif('Accompagnement numérique'),
  collectif: false,
  organisationId: OrganisationId(7),
  suivi: false,
  instruction: null,
  typeDeLieu: null,
  categorieId: null,
  ...surcharge,
})

export const lieuFixture = (
  id: number,
  surcharge: Partial<Lieu> = {},
): Lieu => ({
  id: LieuId(id),
  nom: NomLieu('Médiathèque'),
  adresse: AdresseRdv('1 place du Marché, 44000 Nantes'),
  organisationId: OrganisationId(7),
  telephone: null,
  usageUnique: false,
  ...surcharge,
})

export const participationFixture = (
  id: number,
  usager: Usager,
  surcharge: Partial<Participation> = {},
): Participation => ({
  id: ParticipationId(id),
  usagerId: usager.id,
  usager,
  statutPresence: StatutPresence('unknown'),
  notificationRappel: false,
  notificationsCycleDeVie: false,
  ...surcharge,
})

export const rdvFixture = (
  id: number,
  surcharge: Partial<Extract<Rdv, { collectif: false }>> = {},
): Rdv => ({
  id: RdvId(id),
  uuid: RdvUuid(`00000000-0000-4000-8000-${String(id).padStart(12, '0')}`),
  agentId: RdvAgentId(4242),
  organisationId: OrganisationId(7),
  adresse: AdresseRdv('12 rue de la Paix, 75002 Paris'),
  debut: new Date('2026-08-18T09:00:00.000Z'),
  fin: new Date('2026-08-18T10:00:00.000Z'),
  duree: DureeEnMinutes(60),
  statutPresence: StatutPresence('unknown'),
  urlAgent: UrlAgent(`https://rdv.anct.gouv.fr/admin/rdvs/${id}`),
  nombreParticipants: 1,
  contexte: null,
  creeParId: null,
  annulation: null,
  motif: motifFixture(3),
  lieu: lieuFixture(11),
  participations: [participationFixture(100, usagerFixture(200))],
  collectif: false,
  ...surcharge,
})
