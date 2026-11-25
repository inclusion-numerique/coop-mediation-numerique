import { describe, expect, it } from 'vitest'
import {
  type AdhesionActive,
  type AdhesionArchivee,
} from '../../../domain/adhesion'
import { AdhesionId } from '../../../domain/identifiants/adhesion-id'
import { CoordinateurId } from '../../../domain/identifiants/coordinateur-id'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { exigerAncienMembre } from './ancien-membre'

const coordinateurId = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')

const mediateurId = MediateurId('550e8400-e29b-41d4-a716-446655440011')

const adhesionActive: AdhesionActive = {
  id: AdhesionId('550e8400-e29b-41d4-a716-446655440021'),
  mediateurId,
  coordinateurId,
  depuis: new Date('2026-02-01T09:00:00Z'),
  statut: 'Active',
}

const adhesionArchivee: AdhesionArchivee = {
  id: AdhesionId('550e8400-e29b-41d4-a716-446655440022'),
  mediateurId,
  coordinateurId,
  depuis: new Date('2025-02-01T09:00:00Z'),
  statut: 'Archivee',
  archiveeLe: new Date('2025-06-01T09:00:00Z'),
}

describe('supprimer définitivement un ancien membre', () => {
  it('vise toutes ses adhésions archivées', () => {
    expect(exigerAncienMembre([adhesionArchivee])).toEqual({
      success: true,
      data: [adhesionArchivee],
    })
  })

  it('est refusé tant qu’il fait partie de l’équipe', () => {
    expect(exigerAncienMembre([adhesionArchivee, adhesionActive])).toEqual({
      success: false,
      error: { _tag: 'ToujoursMembre' },
    })
  })

  it('est refusé à qui n’a jamais été membre', () => {
    expect(exigerAncienMembre([])).toEqual({
      success: false,
      error: { _tag: 'PasAncienMembre' },
    })
  })
})
