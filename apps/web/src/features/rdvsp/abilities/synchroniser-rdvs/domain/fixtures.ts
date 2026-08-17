import { AdresseRdv } from '../../../domain/adresse-rdv'
import { DureeEnMinutes } from '../../../domain/duree-en-minutes'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
} from '../../../domain/identite'
import { NomMotif } from '../../../domain/libelle'
import { type Lieu, LieuId, NomLieu } from '../../../domain/lieu'
import type { Motif } from '../../../domain/motif'
import { MotifId } from '../../../domain/motif-id'
import { OrganisationId } from '../../../domain/organisation-id'
import type { Participation } from '../../../domain/participation'
import { ParticipationId } from '../../../domain/participation-id'
import type { Rdv } from '../../../domain/rdv'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { RdvId } from '../../../domain/rdv-id'
import { RdvUuid } from '../../../domain/rdv-uuid'
import { StatutPresence } from '../../../domain/statut-presence'
import { UrlAgent } from '../../../domain/url-agent'
import type { Usager } from '../../../domain/usager'
import { UsagerId } from '../../../domain/usager-id'

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
  annulation: null,
  motif: motifFixture(3),
  lieu: lieuFixture(11),
  participations: [participationFixture(100, usagerFixture(200))],
  collectif: false,
  ...surcharge,
})
