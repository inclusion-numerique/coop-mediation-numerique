import { Search, Sort } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import {
  CoordinateurId,
  Courriel,
  type CriteresEquipe,
  type Lecteur,
  type LigneEquipe,
  MediateurId,
  RoleMembre,
  UtilisateurId,
} from '../../../domain'
import type { LigneContrat } from './contrat-membre'
import { exporterLesMembres } from './exporter-les-membres'
import { TypeContrat } from './type-contrat'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const utilisateurId = UtilisateurId('550e8400-e29b-41d4-a716-446655440031')

const criteres: CriteresEquipe = {
  recherche: Search('martin'),
  statuts: [],
  role: null,
  tri: Sort('membre', 'asc'),
}

const maintenant = new Date('2026-06-01T00:00:00Z')

const gestionnaire: Lecteur = {
  gestionnaire: { type: 'Administrateur' },
  membreActifDeLEquipe: false,
}

const membre: LigneEquipe = {
  email: Courriel('membre@example.com'),
  statut: { type: 'Actif', derniereActivite: maintenant },
  personne: {
    type: 'Inscrite',
    mediateurId: MediateurId('550e8400-e29b-41d4-a716-446655440011'),
    profil: {
      utilisateurId,
      prenom: null,
      nom: null,
      telephone: null,
      role: RoleMembre('MediateurNumerique'),
    },
  },
  structureEmployeuse: { type: 'Inconnue' },
}

const invite: LigneEquipe = {
  email: Courriel('invite@example.com'),
  statut: { type: 'Invitation', envoyeeLe: maintenant },
  personne: { type: 'SansCompte' },
  structureEmployeuse: { type: 'Inconnue' },
}

const cdd: LigneContrat = {
  type: TypeContrat('CDD'),
  debut: new Date('2026-01-01T00:00:00Z'),
  fin: new Date('2026-12-31T00:00:00Z'),
  rompuLe: null,
}

const exporterAvecLesContrats = (contrats: readonly LigneContrat[]) =>
  exporterLesMembres({
    lireLesMembresAExporter: async () => [membre],
    lireLesContratsDesMembres: async () => new Map([[utilisateurId, contrats]]),
  })

describe('exporter les membres d’une équipe', () => {
  it('exporte une personne invitée sans contrat', async () => {
    const exporter = exporterLesMembres({
      lireLesMembresAExporter: async () => [invite],
      lireLesContratsDesMembres: async () => new Map(),
    })

    expect(
      await exporter({
        coordinateurId,
        lecteur: gestionnaire,
        criteres,
        maintenant,
      }),
    ).toEqual({ success: true, data: [{ ligne: invite, contrat: null }] })
  })

  it('exporte un membre dont aucun contrat n’est connu', async () => {
    const exporter = exporterLesMembres({
      lireLesMembresAExporter: async () => [membre],
      lireLesContratsDesMembres: async () => new Map(),
    })

    expect(
      await exporter({
        coordinateurId,
        lecteur: gestionnaire,
        criteres,
        maintenant,
      }),
    ).toEqual({ success: true, data: [{ ligne: membre, contrat: null }] })
  })

  it('retient le contrat le plus récent du membre', async () => {
    const exporter = exporterAvecLesContrats([
      {
        ...cdd,
        type: TypeContrat('PEC'),
        debut: new Date('2024-01-01T00:00:00Z'),
      },
      cdd,
    ])

    expect(
      await exporter({
        coordinateurId,
        lecteur: gestionnaire,
        criteres,
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: [
        {
          ligne: membre,
          contrat: { type: 'CDD', debut: cdd.debut, fin: cdd.fin },
        },
      ],
    })
  })

  it('n’exporte plus un contrat rompu', async () => {
    const exporter = exporterAvecLesContrats([
      { ...cdd, rompuLe: new Date('2026-05-01T00:00:00Z') },
    ])

    expect(
      await exporter({
        coordinateurId,
        lecteur: gestionnaire,
        criteres,
        maintenant,
      }),
    ).toEqual({ success: true, data: [{ ligne: membre, contrat: null }] })
  })

  it('achève le contrat à la rupture annoncée si elle précède la fin prévue', async () => {
    const exporter = exporterAvecLesContrats([
      { ...cdd, rompuLe: new Date('2026-09-01T00:00:00Z') },
    ])

    expect(
      await exporter({
        coordinateurId,
        lecteur: gestionnaire,
        criteres,
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: [
        {
          ligne: membre,
          contrat: {
            type: 'CDD',
            debut: cdd.debut,
            fin: new Date('2026-09-01T00:00:00Z'),
          },
        },
      ],
    })
  })

  it('laisse sans fin le contrat d’un CDI', async () => {
    const exporter = exporterAvecLesContrats([
      { ...cdd, type: TypeContrat('CDI'), fin: null },
    ])

    expect(
      await exporter({
        coordinateurId,
        lecteur: gestionnaire,
        criteres,
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: [
        {
          ligne: membre,
          contrat: { type: 'CDI', debut: cdd.debut, fin: null },
        },
      ],
    })
  })

  it('fait passer un contrat daté avant ceux dont le début est inconnu', async () => {
    const exporter = exporterAvecLesContrats([
      { ...cdd, type: TypeContrat('PEC'), debut: null },
      cdd,
      { ...cdd, type: TypeContrat('CDI'), debut: null },
    ])

    expect(
      await exporter({
        coordinateurId,
        lecteur: gestionnaire,
        criteres,
        maintenant,
      }),
    ).toEqual({
      success: true,
      data: [
        {
          ligne: membre,
          contrat: { type: 'CDD', debut: cdd.debut, fin: cdd.fin },
        },
      ],
    })
  })

  it('est refusé à qui n’est ni membre actif ni gestionnaire de l’équipe', async () => {
    const exporter = exporterAvecLesContrats([])

    expect(
      await exporter({
        coordinateurId,
        lecteur: {
          gestionnaire: { type: 'Autre' },
          membreActifDeLEquipe: false,
        },
        criteres,
        maintenant,
      }),
    ).toEqual({ success: false, error: { _tag: 'ConsultationNonAutorisee' } })
  })
})
