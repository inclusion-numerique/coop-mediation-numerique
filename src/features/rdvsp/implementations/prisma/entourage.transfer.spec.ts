import { describe, expect, it } from 'vitest'
import { MotifId } from '../../domain/identifiants/motif-id'
import { OrganisationId } from '../../domain/identifiants/organisation-id'
import { UsagerId } from '../../domain/identifiants/usager-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../domain/identite'
import { NomMotif } from '../../domain/libelle'
import { AdresseRdv } from '../../domain/rdv/adresse-rdv'
import { type Lieu, LieuId, NomLieu } from '../../domain/rdv/lieu'
import { CategorieMotifId, type Motif } from '../../domain/rdv/motif'
import type { Usager } from '../../domain/usager'
import {
  lieuFromDomain,
  motifFromDomain,
  usagerFromDomain,
} from './entourage.transfer'

const motif: Motif = {
  id: MotifId(3),
  nom: NomMotif('Accompagnement numérique'),
  collectif: true,
  organisationId: OrganisationId(7),
  suivi: true,
  instruction: 'Venir avec son téléphone',
  typeDeLieu: 'public_office',
  categorieId: CategorieMotifId(12),
}

const lieu: Lieu = {
  id: LieuId(11),
  nom: NomLieu('Médiathèque'),
  adresse: AdresseRdv('1 place du Marché, 44000 Nantes'),
  organisationId: OrganisationId(7),
  telephone: TelephoneExterne('02 40 00 00 00'),
  usageUnique: false,
}

const usagerMinimal: Usager = {
  id: UsagerId(200),
  prenom: PrenomExterne('Jean'),
  nom: NomExterne('Dupont'),
  email: null,
  telephone: null,
  telephoneFormate: null,
  dateNaissance: null,
  creation: null,
  invitationCreee: null,
  invitationAcceptee: null,
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

const usagerComplet: Usager = {
  ...usagerMinimal,
  email: EmailExterne('jean.dupont@example.com'),
  telephone: TelephoneExterne('06 12 34 56 78'),
  telephoneFormate: TelephoneExterne('+33612345678'),
  dateNaissance: new Date('1960-05-04T00:00:00.000Z'),
  creation: new Date('2026-01-10T08:00:00.000Z'),
  invitationCreee: new Date('2026-01-11T08:00:00.000Z'),
  invitationAcceptee: new Date('2026-01-12T08:00:00.000Z'),
  coordonnees: {
    adresse: '3 rue des Lilas, 44000 Nantes',
    complementAdresse: 'Bâtiment B',
    numeroAllocataire: '1234567',
    caisseAffiliation: 'caf',
    nomNaissance: 'Durand',
  },
  responsableId: UsagerId(199),
  notifierParEmail: true,
  notifierParSms: true,
}

describe('écriture de l’entourage d’un rendez-vous', () => {
  it('écrit un motif dans les colonnes de la base', () => {
    expect(motifFromDomain(motif)).toEqual({
      id: 3,
      name: 'Accompagnement numérique',
      collectif: true,
      organisationId: 7,
      followUp: true,
      instructionForRdv: 'Venir avec son téléphone',
      locationType: 'public_office',
      motifCategoryId: 12,
    })
  })

  it('écrit un lieu dans les colonnes de la base', () => {
    expect(lieuFromDomain(lieu)).toEqual({
      id: 11,
      name: 'Médiathèque',
      address: '1 place du Marché, 44000 Nantes',
      organisationId: 7,
      phoneNumber: '02 40 00 00 00',
      singleUse: false,
    })
  })

  it('écrit l’adresse absente d’un lieu comme une chaîne vide', () => {
    expect(lieuFromDomain({ ...lieu, adresse: null }).address).toBe('')
  })

  it('écrit un usager sans coordonnées', () => {
    expect(usagerFromDomain(usagerMinimal)).toEqual({
      id: 200,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: null,
      phoneNumber: null,
      phoneNumberFormatted: null,
      address: null,
      addressDetails: null,
      affiliationNumber: null,
      birthDate: null,
      birthName: null,
      caisseAffiliation: null,
      createdAt: null,
      invitationCreatedAt: null,
      invitationAcceptedAt: null,
      notifyByEmail: false,
      notifyBySms: false,
    })
  })

  it('écrit un usager complet sans son responsable', () => {
    expect(usagerFromDomain(usagerComplet)).toEqual({
      id: 200,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phoneNumber: '06 12 34 56 78',
      phoneNumberFormatted: '+33612345678',
      address: '3 rue des Lilas, 44000 Nantes',
      addressDetails: 'Bâtiment B',
      affiliationNumber: '1234567',
      birthDate: new Date('1960-05-04T00:00:00.000Z'),
      birthName: 'Durand',
      caisseAffiliation: 'caf',
      createdAt: new Date('2026-01-10T08:00:00.000Z'),
      invitationCreatedAt: new Date('2026-01-11T08:00:00.000Z'),
      invitationAcceptedAt: new Date('2026-01-12T08:00:00.000Z'),
      notifyByEmail: true,
      notifyBySms: true,
    })
  })
})
