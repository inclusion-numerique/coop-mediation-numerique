import {
  ClientApiId,
  NomDuClientApi,
} from '@app/web/features/clients-api/domain'
import { ligneDeClientApi } from './clients-api.presenter'

const client = {
  id: ClientApiId('a1b2c3d4-0000-4000-8000-000000000001'),
  nom: NomDuClientApi('Tableau de bord ANCT'),
  portees: ['Activites', 'LieuxActivite'] as const,
  validite: { debut: new Date('2026-01-01T00:00:00Z'), fin: null },
  creeLe: new Date('2026-01-01T00:00:00Z'),
  modifieLe: new Date('2026-01-01T00:00:00Z'),
}

describe('présentation d’un client API dans la liste', () => {
  it('mène à la fiche du client', () => {
    expect(ligneDeClientApi(client).href).toBe(
      '/administration/clients-api/a1b2c3d4-0000-4000-8000-000000000001',
    )
  })

  it('nomme ses permissions', () => {
    expect(ligneDeClientApi(client).permissions).toBe(
      'Activités, LieuxActivite',
    )
  })

  it('annonce un client sans fin de validité', () => {
    expect(ligneDeClientApi(client).fin).toBe('Jamais')
  })
})
