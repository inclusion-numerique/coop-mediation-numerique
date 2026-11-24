import { describe, expect, it } from 'vitest'
import { MotifId } from '../../domain/identifiants/motif-id'
import { OrganisationId } from '../../domain/identifiants/organisation-id'
import { ParticipationId } from '../../domain/identifiants/participation-id'
import { RdvAgentId } from '../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../domain/identifiants/rdv-id'
import { RdvUuid } from '../../domain/identifiants/rdv-uuid'
import { UsagerId } from '../../domain/identifiants/usager-id'
import { NomExterne, PrenomExterne } from '../../domain/identite'
import { NomAtelier, NomMotif } from '../../domain/libelle'
import { AdresseRdv } from '../../domain/rdv/adresse-rdv'
import { DureeEnMinutes } from '../../domain/rdv/duree-en-minutes'
import { type Lieu, LieuId, NomLieu } from '../../domain/rdv/lieu'
import type { Motif } from '../../domain/rdv/motif'
import { NombreParticipantsMax } from '../../domain/rdv/nombre-participants-max'
import type { Rdv } from '../../domain/rdv/rdv'
import { StatutPresence } from '../../domain/rdv/statut-presence'
import { UrlAgent } from '../../domain/url-agent'
import type { Usager } from '../../domain/usager'
import {
  participationFromDomain,
  type RdvRow,
  rdvFromDomain,
  rdvToDomain,
} from './rdv.transfer'

const base = {
  id: RdvId(1),
  uuid: RdvUuid('0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b'),
  agentId: RdvAgentId(42),
  organisationId: OrganisationId(7),
  debut: new Date('2026-08-17T09:00:00.000Z'),
  fin: new Date('2026-08-17T10:00:00.000Z'),
  duree: DureeEnMinutes(60),
  statutPresence: StatutPresence('unknown'),
  urlAgent: UrlAgent('https://rdv.anct.gouv.fr/admin/rdvs/1'),
  nombreParticipants: 1,
  contexte: null,
  creeParId: null,
  annulation: null,
  motif: null,
  lieu: null,
  participations: [],
} as const

const usager: Usager = {
  id: UsagerId(200),
  prenom: PrenomExterne('Jean'),
  nom: NomExterne('Dupont'),
  email: null,
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
}

const participation = {
  id: ParticipationId(100),
  usagerId: UsagerId(200),
  usager,
  statutPresence: StatutPresence('seen'),
  notificationRappel: true,
  notificationsCycleDeVie: false,
} as const

const motif: Motif = {
  id: MotifId(3),
  nom: NomMotif('Accompagnement numérique'),
  collectif: false,
  organisationId: OrganisationId(7),
  suivi: false,
  instruction: null,
  typeDeLieu: null,
  categorieId: null,
}

const lieu: Lieu = {
  id: LieuId(11),
  nom: NomLieu('Médiathèque'),
  adresse: AdresseRdv('1 place du Marché, 44000 Nantes'),
  organisationId: OrganisationId(7),
  telephone: null,
  usageUnique: false,
}

/**
 * Reconstitue la ligne complète : `raw_data`, les colonnes de traçabilité et le
 * libellé du motif ne traversent pas `rdvFromDomain`.
 */
const ligneMotif = (motifDomaine: Motif) => ({
  id: motifDomaine.id,
  name: motifDomaine.nom,
  collectif: motifDomaine.collectif,
  organisationId: motifDomaine.organisationId,
  followUp: motifDomaine.suivi,
  instructionForRdv: motifDomaine.instruction,
  locationType: motifDomaine.typeDeLieu,
  motifCategoryId: motifDomaine.categorieId,
})

const ligneLieu = (lieuDomaine: Lieu) => ({
  id: lieuDomaine.id,
  name: lieuDomaine.nom,
  address: lieuDomaine.adresse ?? '',
  organisationId: lieuDomaine.organisationId,
  phoneNumber: lieuDomaine.telephone,
  singleUse: lieuDomaine.usageUnique,
  syncedAt: new Date('2026-08-17T06:00:00.000Z'),
})

const ligneUsager = (usagerDomaine: Usager) => ({
  id: usagerDomaine.id,
  firstName: usagerDomaine.prenom,
  lastName: usagerDomaine.nom,
  email: usagerDomaine.email,
  phoneNumber: usagerDomaine.telephone,
  phoneNumberFormatted: null,
  birthDate: usagerDomaine.dateNaissance,
  address: usagerDomaine.coordonnees.adresse,
  addressDetails: usagerDomaine.coordonnees.complementAdresse,
  affiliationNumber: usagerDomaine.coordonnees.numeroAllocataire,
  caisseAffiliation: usagerDomaine.coordonnees.caisseAffiliation,
  birthName: usagerDomaine.coordonnees.nomNaissance,
  responsibleId: usagerDomaine.responsableId,
  notifyByEmail: usagerDomaine.notifierParEmail,
  notifyBySms: usagerDomaine.notifierParSms,
  createdAt: null,
  invitationAcceptedAt: null,
  invitationCreatedAt: null,
  syncedAt: new Date('2026-08-17T06:00:00.000Z'),
})

const toRow = (rdv: Rdv): RdvRow => ({
  ...rdvFromDomain(rdv),
  motif: rdv.motif === null ? null : ligneMotif(rdv.motif),
  lieu: rdv.lieu === null ? null : ligneLieu(rdv.lieu),
  participations: rdv.participations.map((participation) => ({
    ...participationFromDomain(participation),
    user: ligneUsager(participation.usager),
    rdvId: rdv.id,
    createdBy: null,
    createdByType: null,
    createdById: null,
    createdByAgentPrescripteur: null,
    syncedAt: new Date('2026-08-17T06:00:00.000Z'),
  })),
  lieuId: null,
  context: null,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
  createdBy: null,
  createdByType: null,
  createdById: null,
  compteRenduRegle: false,
  syncedAt: new Date('2026-08-17T06:00:00.000Z'),
  rawData: { id: 1 },
})

describe('transfer rendez-vous', () => {
  describe('aller-retour domaine → Prisma → domaine', () => {
    it('conserve un rendez-vous individuel minimal', () => {
      const rdv: Rdv = { ...base, adresse: null, collectif: false }

      expect(rdvToDomain(toRow(rdv))).toEqual(rdv)
    })

    it('conserve un rendez-vous individuel tout renseigné', () => {
      const rdv: Rdv = {
        ...base,
        adresse: AdresseRdv('12 rue de la Paix, 75002 Paris'),
        annulation: new Date('2026-08-16T08:00:00.000Z'),
        statutPresence: StatutPresence('revoked'),
        motif,
        lieu,
        participations: [participation],
        collectif: false,
      }

      expect(rdvToDomain(toRow(rdv))).toEqual(rdv)
    })

    it('conserve un atelier collectif sans nom ni jauge', () => {
      const rdv: Rdv = {
        ...base,
        adresse: null,
        collectif: true,
        nom: null,
        participantsMax: null,
      }

      expect(rdvToDomain(toRow(rdv))).toEqual(rdv)
    })

    it('conserve un atelier collectif tout renseigné', () => {
      const rdv: Rdv = {
        ...base,
        adresse: AdresseRdv('Médiathèque, 44000 Nantes'),
        collectif: true,
        nom: NomAtelier('Atelier CV'),
        participantsMax: NombreParticipantsMax(12),
        participations: [participation],
      }

      expect(rdvToDomain(toRow(rdv))).toEqual(rdv)
    })
  })

  describe('lecture de lignes existantes', () => {
    it('ramène une adresse vide à l’absence plutôt que de refuser la ligne', () => {
      const row = {
        ...toRow({ ...base, adresse: null, collectif: false }),
        address: '',
      }

      expect(rdvToDomain(row).adresse).toBeNull()
    })

    it('lit un collectif dont le nom est vide', () => {
      const row = {
        ...toRow({
          ...base,
          adresse: null,
          collectif: true,
          nom: null,
          participantsMax: null,
        }),
        name: '',
      }

      const rdv = rdvToDomain(row)

      expect(rdv.collectif && rdv.nom).toBeNull()
    })
  })
})
