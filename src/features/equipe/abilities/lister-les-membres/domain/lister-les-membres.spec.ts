import { Page, PageSize, Search, Sort } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import { CodeDepartement } from '@/libraries/insee'
import {
  CoordinateurId,
  Courriel,
  type CriteresEquipe,
  type Lecteur,
  NomAffiche,
} from '../../../domain'
import { listerLesMembres } from './lister-les-membres'
import type {
  CoordinateurDeLaListe,
  MembresDeLEquipe,
} from './membres-de-l-equipe'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const criteres: CriteresEquipe = {
  recherche: Search('martin'),
  statuts: [],
  role: null,
  tri: Sort('membre', 'asc'),
}

const coordinateur: CoordinateurDeLaListe = {
  nom: NomAffiche('Camille Martin'),
  email: Courriel('camille.martin@example.com'),
  telephone: null,
  departementCode: CodeDepartement('69'),
}

const membres: Omit<MembresDeLEquipe, 'coordinateur'> = {
  items: [],
  statistiques: {
    total: 0,
    actifs: 0,
    inactifs: 0,
    invitations: 0,
    archives: 0,
    conseillersNumeriques: 0,
  },
  totalItems: 0,
  currentPage: Page(1),
  pageSize: PageSize(20),
}

const membreActif: Lecteur = {
  gestionnaire: { type: 'Autre' },
  membreActifDeLEquipe: true,
}

const maintenant = new Date('2026-10-14T09:00:00Z')

describe('lister les membres d’une équipe', () => {
  it('rend les membres avec le coordinateur de l’équipe', async () => {
    const lister = listerLesMembres({
      coordinateurDeLEquipe: async () => coordinateur,
      lireLesMembres: async () => membres,
    })

    expect(
      await lister({
        coordinateurId,
        lecteur: membreActif,
        criteres,
        page: Page(1),
        pageSize: PageSize(20),
        maintenant,
      }),
    ).toEqual({ success: true, data: { coordinateur, ...membres } })
  })

  it('est refusé à qui n’est ni membre actif ni gestionnaire de l’équipe', async () => {
    const lister = listerLesMembres({
      coordinateurDeLEquipe: async () => coordinateur,
      lireLesMembres: async () => membres,
    })

    expect(
      await lister({
        coordinateurId,
        lecteur: {
          gestionnaire: { type: 'Autre' },
          membreActifDeLEquipe: false,
        },
        criteres,
        page: Page(1),
        pageSize: PageSize(20),
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: 'ConsultationNonAutorisee' } })
  })

  it('échoue quand le coordinateur de l’équipe est introuvable', async () => {
    const lister = listerLesMembres({
      coordinateurDeLEquipe: async () => null,
      lireLesMembres: async () => membres,
    })

    expect(
      await lister({
        coordinateurId,
        lecteur: membreActif,
        criteres,
        page: Page(1),
        pageSize: PageSize(20),
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: 'CoordinateurIntrouvable' } })
  })
})
