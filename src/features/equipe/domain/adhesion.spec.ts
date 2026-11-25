import { describe, expect, it } from 'vitest'
import {
  type AdhesionActive,
  type AdhesionArchivee,
  adherer,
  archiver,
} from './adhesion'
import { AdhesionId } from './identifiants/adhesion-id'
import { CoordinateurId } from './identifiants/coordinateur-id'
import { MediateurId } from './identifiants/mediateur-id'

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

const maintenant = new Date('2026-10-14T09:00:00Z')

describe('archiver une adhésion', () => {
  it('archive l’adhésion active, pas une ancienne', () => {
    expect(archiver([adhesionArchivee, adhesionActive], maintenant)).toEqual({
      success: true,
      data: { ...adhesionActive, statut: 'Archivee', archiveeLe: maintenant },
    })
  })

  it('échoue quand le médiateur n’est plus membre', () => {
    expect(archiver([adhesionArchivee], maintenant)).toEqual({
      success: false,
      error: { _tag: 'PasMembre' },
    })
  })
})

describe('adhérer à une équipe', () => {
  const nouvelle = { mediateurId, coordinateurId }

  it('est possible pour un ancien membre', () => {
    expect(adherer(nouvelle, [adhesionArchivee])).toEqual({
      success: true,
      data: nouvelle,
    })
  })

  it('est refusé à un membre actif', () => {
    expect(adherer(nouvelle, [adhesionActive])).toEqual({
      success: false,
      error: { _tag: 'DejaMembre', mediateurId },
    })
  })
})
