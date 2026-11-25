import { describe, expect, it } from 'vitest'
import {
  type AdhesionActive,
  type AdhesionArchivee,
} from '../../domain/adhesion'
import { AdhesionId } from '../../domain/identifiants/adhesion-id'
import { CoordinateurId } from '../../domain/identifiants/coordinateur-id'
import { MediateurId } from '../../domain/identifiants/mediateur-id'
import { fromAdhesion, toAdhesion } from './adhesion.transfer'

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

describe('transfert d’une adhésion', () => {
  it.each([
    ['active', adhesionActive],
    ['archivée', adhesionArchivee],
  ])('fait l’aller-retour : %s', (_, adhesion) => {
    expect(toAdhesion(fromAdhesion(adhesion))).toEqual(adhesion)
  })
})
