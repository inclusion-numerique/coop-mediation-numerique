import { Page, PageSize, Search, Sort } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import {
  type CoordinateurDeLEquipe,
  CoordinateurId,
  Courriel,
  type CriteresEquipe,
  type Lecteur,
  NomAffiche,
} from '../../../domain'
import { listerLesMembres } from './lister-les-membres'
import type { MembresDeLEquipe } from './membres-de-l-equipe'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const criteres: CriteresEquipe = {
  recherche: Search('martin'),
  statuts: [],
  role: null,
  tri: Sort('membre', 'asc'),
}

const coordinateur: CoordinateurDeLEquipe = {
  nom: NomAffiche('Camille Martin'),
  email: Courriel('camille.martin@example.com'),
  telephone: null,
}

const departementCode = CodeDepartement('69')

const communeDeLEmployeuse = CodeInsee('69123')

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
  it('rend les membres avec le coordinateur de l’équipe, situé par la commune de son employeuse', async () => {
    const lister = listerLesMembres({
      lireLeCoordinateur: async () => coordinateur,
      lireLaCommuneDuCoordinateur: async () => communeDeLEmployeuse,
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
    ).toEqual({
      success: true,
      data: { coordinateur: { ...coordinateur, departementCode }, ...membres },
    })
  })

  it('situe dans le département par défaut un coordinateur sans commune d’employeuse', async () => {
    const lister = listerLesMembres({
      lireLeCoordinateur: async () => coordinateur,
      lireLaCommuneDuCoordinateur: async () => null,
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
    ).toEqual({
      success: true,
      data: {
        coordinateur: {
          ...coordinateur,
          departementCode: CodeDepartement('75'),
        },
        ...membres,
      },
    })
  })

  it('est refusé à qui n’est ni membre actif ni gestionnaire de l’équipe', async () => {
    const lister = listerLesMembres({
      lireLeCoordinateur: async () => coordinateur,
      lireLaCommuneDuCoordinateur: async () => communeDeLEmployeuse,
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
      lireLeCoordinateur: async () => null,
      lireLaCommuneDuCoordinateur: async () => communeDeLEmployeuse,
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
  it('rend les membres au coordinateur de l’équipe', async () => {
    const lister = listerLesMembres({
      lireLeCoordinateur: async () => coordinateur,
      lireLaCommuneDuCoordinateur: async () => communeDeLEmployeuse,
      lireLesMembres: async () => membres,
    })

    expect(
      await lister({
        coordinateurId,
        lecteur: {
          gestionnaire: { type: 'Coordinateur', coordinateurId },
          membreActifDeLEquipe: false,
        },
        criteres,
        page: Page(1),
        pageSize: PageSize(20),
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: { coordinateur: { ...coordinateur, departementCode }, ...membres },
    })
  })

  it('est refusé au coordinateur d’une autre équipe', async () => {
    const lister = listerLesMembres({
      lireLeCoordinateur: async () => coordinateur,
      lireLaCommuneDuCoordinateur: async () => communeDeLEmployeuse,
      lireLesMembres: async () => membres,
    })

    expect(
      await lister({
        coordinateurId,
        lecteur: {
          gestionnaire: {
            type: 'Coordinateur',
            coordinateurId: CoordinateurId(
              '550e8400-e29b-41d4-a716-446655440002',
            ),
          },
          membreActifDeLEquipe: false,
        },
        criteres,
        page: Page(1),
        pageSize: PageSize(20),
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: 'ConsultationNonAutorisee' } })
  })
})
