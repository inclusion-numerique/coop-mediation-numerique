import { describe, expect, it } from 'vitest'
import { CodeInsee } from '@/libraries/insee'
import {
  AdresseCourriel,
  Dispositif,
  JAMAIS,
  jalon,
  type LigneUtilisateur,
  Nom,
  NomAffiche,
  NomEmployeuse,
  Prenom,
  RoleUtilisateur,
  UtilisateurId,
} from '../../domain'
import {
  type LigneUtilisateurRow,
  ligneUtilisateurToDomain,
} from './ligne-utilisateur.transfer'

const maintenant = new Date('2026-11-24T09:00:00.000Z')
const creeLe = new Date('2026-11-14T09:00:00.000Z')
const inscritLe = new Date('2026-09-01T09:00:00.000Z')
const derniereActivite = new Date('2026-11-20T09:00:00.000Z')
const dernierBeneficiaire = new Date('2026-11-18T09:00:00.000Z')
const derniereConnexion = new Date('2026-11-22T09:00:00.000Z')
const derniereVisite = new Date('2026-11-23T09:00:00.000Z')

const minimale: LigneUtilisateurRow = {
  id: '3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f',
  name: null,
  firstName: null,
  lastName: null,
  email: 'jeanne@example.com',
  role: 'User',
  created: creeLe,
  deleted: null,
  inscriptionValidee: null,
  lastLogin: null,
  lastSeen: null,
  mediateur: null,
  coordinateur: null,
  personneMain: null,
}

const complete: LigneUtilisateurRow = {
  ...minimale,
  firstName: 'Jeanne',
  lastName: 'Martin',
  name: 'Jeanne Martin',
  created: inscritLe,
  inscriptionValidee: inscritLe,
  lastLogin: derniereConnexion,
  lastSeen: derniereVisite,
  mediateur: {
    derniereCreationActivite: derniereActivite,
    derniereCreationBeneficiaire: dernierBeneficiaire,
    accompagnementsCount: 42,
    beneficiairesCount: 17,
    _count: { enActivite: 2 },
  },
  coordinateur: {
    derniereCreationActivite: derniereActivite,
    _count: { mediateursCoordonnes: 5 },
  },
  personneMain: {
    employeuseActuelle: { nom: 'Mairie de Reims', codeInsee: '51454' },
    conseillerNumeriqueEnPoste: { personneId: 1 },
  },
}

const employeuseDe = (
  employeuseActuelle: NonNullable<
    LigneUtilisateurRow['personneMain']
  >['employeuseActuelle'],
): LigneUtilisateur['employeuse'] =>
  ligneUtilisateurToDomain(
    {
      ...minimale,
      personneMain: { employeuseActuelle, conseillerNumeriqueEnPoste: null },
    },
    maintenant,
  ).employeuse

describe('ligne de la liste des utilisateurs lue en base', () => {
  it('lit une inscription en cours sans identité ni rattachement', () => {
    expect(ligneUtilisateurToDomain(minimale, maintenant)).toEqual({
      id: UtilisateurId('3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f'),
      nomAffiche: NomAffiche('jeanne@example.com'),
      prenom: null,
      nom: null,
      courriel: AdresseCourriel('jeanne@example.com'),
      role: RoleUtilisateur('User'),
      creeLe,
      derniereConnexion: JAMAIS,
      derniereVisite: JAMAIS,
      statut: { _tag: 'InscriptionEnCours', palier: 7 },
      rattachements: { _tag: 'aucun' },
      dispositif: Dispositif('HorsDispositif'),
      employeuse: null,
    } satisfies LigneUtilisateur)
  })

  it('lit un conseiller numérique actif, médiateur et coordinateur', () => {
    expect(ligneUtilisateurToDomain(complete, maintenant)).toEqual({
      id: UtilisateurId('3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f'),
      nomAffiche: NomAffiche('Jeanne Martin'),
      prenom: Prenom('Jeanne'),
      nom: Nom('Martin'),
      courriel: AdresseCourriel('jeanne@example.com'),
      role: RoleUtilisateur('User'),
      creeLe: inscritLe,
      derniereConnexion: jalon(derniereConnexion),
      derniereVisite: jalon(derniereVisite),
      statut: { _tag: 'Actif' },
      rattachements: {
        _tag: 'mediateurEtCoordinateur',
        mediateur: {
          derniereActivite: jalon(derniereActivite),
          dernierBeneficiaire: jalon(dernierBeneficiaire),
          accompagnements: 42,
          beneficiaires: 17,
          lieuxActivite: 2,
        },
        coordinateur: { aCoordonne: true, mediateursCoordonnes: 5 },
      },
      dispositif: Dispositif('ConseillerNumerique'),
      employeuse: {
        nom: NomEmployeuse('Mairie de Reims'),
        codeInsee: CodeInsee('51454'),
      },
    } satisfies LigneUtilisateur)
  })

  it('lit le statut supprimé avant tout autre', () => {
    expect(
      ligneUtilisateurToDomain(
        { ...complete, deleted: derniereVisite },
        maintenant,
      ).statut,
    ).toEqual({ _tag: 'Supprime' })
  })

  it('lit une employeuse sans nom ni code INSEE lisibles', () => {
    expect(employeuseDe({ nom: null, codeInsee: '999' })).toEqual({
      nom: null,
      codeInsee: null,
    })
  })

  it('lit l’absence d’employeuse actuelle', () => {
    expect(employeuseDe(null)).toBeNull()
  })

  it.each([
    ['un identifiant', { ...minimale, id: 'pas-un-identifiant' }],
    ['un courriel', { ...minimale, email: 'pas un courriel' }],
  ])('rejette %s illisible', (_, ligne) => {
    expect(() => ligneUtilisateurToDomain(ligne, maintenant)).toThrow()
  })
})
