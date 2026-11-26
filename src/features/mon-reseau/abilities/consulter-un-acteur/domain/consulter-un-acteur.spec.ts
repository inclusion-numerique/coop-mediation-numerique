import { describe, expect, it } from 'vitest'
import { CodeDepartement } from '@/libraries/insee'
import { NomAffiche } from '@/libraries/nom-affiche'
import {
  type Acteur,
  ActeurId,
  CoordinateurId,
  Courriel,
  Dispositif,
  Effectif,
  MediateurId,
  type Mediation,
} from '../../../domain'
import {
  type ConsulterUnActeurPorts,
  consulterUnActeur,
  type QuiConsulte,
} from './consulter-un-acteur'
import type { RelationDEquipe } from './fiche-acteur'
import type { AdhesionLue } from './relation-d-equipe'
import type {
  DerniereActivite,
  StatutDActivitePublic,
} from './statut-d-activite-public'

const maintenant = new Date('2026-10-23T12:00:00Z')
const profilCreeLe = new Date('2025-02-01T00:00:00Z')
const lecteurId = 'd1b2c3d4-0000-4000-8000-000000000001'
const coordinateurDuLecteur = CoordinateurId(
  'd1b2c3d4-0000-4000-8000-000000000002',
)

const mediation: Mediation = {
  mediateurId: MediateurId('a1b2c3d4-0000-4000-8000-000000000001'),
  nombreDeLieux: Effectif(2),
  coordinateurs: [
    {
      acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000002'),
      nomAffiche: NomAffiche('Alex Durand'),
      departement: CodeDepartement('15'),
    },
  ],
}

const mediateur: Acteur = {
  acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000003'),
  nomAffiche: NomAffiche('Camille Martin'),
  courriel: Courriel('camille.martin@example.org'),
  profil: {
    _tag: 'Mediateur',
    dispositif: Dispositif('HorsDispositif'),
    mediation,
  },
}

const coordinateurSansMediation: Acteur = {
  acteurId: ActeurId('a1b2c3d4-0000-4000-8000-000000000004'),
  nomAffiche: NomAffiche('Sacha Bernard'),
  courriel: Courriel('sacha.bernard@example.org'),
  profil: {
    _tag: 'Coordinateur',
    dispositif: Dispositif('ConseillerNumerique'),
    coordinateurId: CoordinateurId('a1b2c3d4-0000-4000-8000-000000000005'),
    mediation: null,
  },
}

const statistiques = {
  beneficiairesAccompagnes: Effectif(4),
  accompagnements: Effectif(7),
}

const ports: ConsulterUnActeurPorts = {
  lireLActeur: async () => ({ acteur: mediateur, profilCreeLe }),
  lireLesLiensDEquipe: async () => ({
    adhesions: [],
    invitationEnCours: null,
  }),
  lireLaDerniereActivite: async () => ({ _tag: 'Jamais' }),
  lireLesStatistiquesSur30Jours: async () => statistiques,
}

const parUnMediateur: QuiConsulte = { id: lecteurId, coordinateur: null }

const parUnCoordinateur: QuiConsulte = {
  id: lecteurId,
  coordinateur: { id: coordinateurDuLecteur },
}

const adhesionTerminee2025: AdhesionLue = {
  _tag: 'Terminee',
  debut: new Date('2025-01-01'),
  fin: new Date('2025-06-01'),
}

const adhesionTerminee2026: AdhesionLue = {
  _tag: 'Terminee',
  debut: new Date('2026-01-01'),
  fin: new Date('2026-03-01'),
}

describe('consulter un acteur', () => {
  it('signale un acteur introuvable quand l’identifiant est invalide', async () => {
    expect(
      await consulterUnActeur(ports)({
        quiConsulte: parUnMediateur,
        acteurId: 'pas-un-identifiant',
        maintenant,
      }),
    ).toEqual({
      success: false,
      error: { _tag: 'ActeurIntrouvable', acteurId: 'pas-un-identifiant' },
    })
  })

  it('signale un acteur introuvable quand il n’est pas visible', async () => {
    expect(
      await consulterUnActeur({ ...ports, lireLActeur: async () => null })({
        quiConsulte: parUnMediateur,
        acteurId: mediateur.acteurId,
        maintenant,
      }),
    ).toEqual({
      success: false,
      error: { _tag: 'ActeurIntrouvable', acteurId: mediateur.acteurId },
    })
  })

  it.each<{
    cas: string
    derniere: DerniereActivite
    statut: StatutDActivitePublic
  }>([
    {
      cas: 'actif avec une activité dans les 30 derniers jours',
      derniere: { _tag: 'Le', date: new Date('2026-10-01T12:00:00Z') },
      statut: { _tag: 'Actif' },
    },
    {
      cas: 'inactif depuis sa dernière activité au-delà de 30 jours',
      derniere: { _tag: 'Le', date: new Date('2026-09-01T12:00:00Z') },
      statut: {
        _tag: 'InactifDepuis',
        derniereActivite: new Date('2026-09-01T12:00:00Z'),
      },
    },
    {
      cas: 'jamais actif sans aucune activité',
      derniere: { _tag: 'Jamais' },
      statut: { _tag: 'JamaisActif' },
    },
  ])(
    'montre à un médiateur un acteur $cas, sans rien dire de l’équipe',
    async ({ derniere, statut }) => {
      expect(
        await consulterUnActeur({
          ...ports,
          lireLaDerniereActivite: async () => derniere,
        })({
          quiConsulte: parUnMediateur,
          acteurId: mediateur.acteurId,
          maintenant,
        }),
      ).toEqual({
        success: true,
        data: {
          acteur: mediateur,
          profilCreeLe,
          statut,
          regard: { _tag: 'Mediateur' },
        },
      })
    },
  )

  it.each<{
    cas: string
    acteur: Acteur
    adhesions: readonly AdhesionLue[]
    invitationEnCours: Date | null
    relation: RelationDEquipe
  }>([
    {
      cas: 'ne coordonne pas un acteur qui ne fait pas de médiation',
      acteur: coordinateurSansMediation,
      adhesions: [],
      invitationEnCours: null,
      relation: { _tag: 'NonCoordonnable' },
    },
    {
      cas: 'ne se coordonne pas lui-même',
      acteur: { ...mediateur, acteurId: ActeurId(lecteurId) },
      adhesions: [],
      invitationEnCours: null,
      relation: { _tag: 'NonCoordonnable' },
    },
    {
      cas: 'est hors équipe sans adhésion ni invitation',
      acteur: mediateur,
      adhesions: [],
      invitationEnCours: null,
      relation: { _tag: 'HorsEquipe' },
    },
    {
      cas: 'est membre avec ses statistiques sur 30 jours, même invité',
      acteur: mediateur,
      adhesions: [{ _tag: 'EnCours' }],
      invitationEnCours: new Date('2026-10-01'),
      relation: { _tag: 'Membre', statistiques },
    },
    {
      cas: 'est invité quand une invitation attend sa réponse',
      acteur: mediateur,
      adhesions: [],
      invitationEnCours: new Date('2026-10-01'),
      relation: { _tag: 'Invite', invitationLe: new Date('2026-10-01') },
    },
    {
      cas: 'est ancien membre depuis sa dernière adhésion terminée',
      acteur: mediateur,
      adhesions: [adhesionTerminee2025, adhesionTerminee2026],
      invitationEnCours: null,
      relation: {
        _tag: 'AncienMembre',
        depuis: new Date('2026-01-01'),
        fin: new Date('2026-03-01'),
      },
    },
    {
      cas: 'reste ancien membre depuis l’adhésion la plus récente, quel que soit l’ordre de lecture',
      acteur: mediateur,
      adhesions: [adhesionTerminee2026, adhesionTerminee2025],
      invitationEnCours: null,
      relation: {
        _tag: 'AncienMembre',
        depuis: new Date('2026-01-01'),
        fin: new Date('2026-03-01'),
      },
    },
  ])(
    'pour un coordinateur, l’acteur $cas',
    async ({ acteur, adhesions, invitationEnCours, relation }) => {
      expect(
        await consulterUnActeur({
          ...ports,
          lireLActeur: async () => ({ acteur, profilCreeLe }),
          lireLesLiensDEquipe: async () => ({ adhesions, invitationEnCours }),
        })({
          quiConsulte: parUnCoordinateur,
          acteurId: acteur.acteurId,
          maintenant,
        }),
      ).toEqual({
        success: true,
        data: {
          acteur,
          profilCreeLe,
          statut: { _tag: 'JamaisActif' },
          regard: {
            _tag: 'Coordinateur',
            coordinateurId: coordinateurDuLecteur,
            relation,
          },
        },
      })
    },
  )
})
