import {
  ClientApiId,
  NomDuClientApi,
} from '@app/web/features/clients-api/domain'
import { depuisDefinition, versClientApi } from './client-api.transfer'

describe('transfert d’un client API', () => {
  it('relit à l’identique une définition enregistrée', () => {
    const definition = {
      nom: NomDuClientApi('Tableau de bord ANCT'),
      portees: ['Activites', 'Statistiques'] as const,
      validite: {
        debut: new Date('2026-01-01'),
        fin: new Date('2026-12-31'),
      },
    }
    const creeLe = new Date('2026-01-01T09:00:00Z')

    const relu = versClientApi({
      id: 'a1b2c3d4-0000-4000-8000-000000000001',
      ...depuisDefinition(definition),
      created: creeLe,
      updated: creeLe,
    })

    expect(relu).toEqual({
      id: ClientApiId('a1b2c3d4-0000-4000-8000-000000000001'),
      ...definition,
      portees: ['Activites', 'Statistiques'],
      creeLe,
      modifieLe: creeLe,
    })
  })

  it('relit à l’identique un client sans fin de validité', () => {
    const definition = {
      nom: NomDuClientApi('Observatoire'),
      portees: ['Utilisateurs'] as const,
      validite: { debut: new Date('2026-01-01'), fin: null },
    }
    const creeLe = new Date('2026-01-01T09:00:00Z')

    expect(
      versClientApi({
        id: 'a1b2c3d4-0000-4000-8000-000000000002',
        ...depuisDefinition(definition),
        created: creeLe,
        updated: creeLe,
      }),
    ).toEqual({
      id: ClientApiId('a1b2c3d4-0000-4000-8000-000000000002'),
      ...definition,
      portees: ['Utilisateurs'],
      creeLe,
      modifieLe: creeLe,
    })
  })
})
