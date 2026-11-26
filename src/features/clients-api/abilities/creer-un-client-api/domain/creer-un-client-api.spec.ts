import { describe, expect, it } from 'vitest'
import {
  type ClientApi,
  ClientApiId,
  type DefinitionDuClientApi,
  NomDuClientApi,
  PorteeApi,
} from '@/features/clients-api/domain'
import { creerUnClientApi } from './creer-un-client-api'

const definition: DefinitionDuClientApi = {
  nom: NomDuClientApi('Tableau de bord'),
  portees: [PorteeApi('Activites')],
  validite: { debut: new Date('2026-01-01T00:00:00.000Z'), fin: null },
}

const client: ClientApi = {
  ...definition,
  id: ClientApiId('a1b2c3d4-0000-4000-8000-000000000001'),
  creeLe: new Date('2026-01-01T00:00:00.000Z'),
  modifieLe: new Date('2026-01-01T00:00:00.000Z'),
}

const creer = (nomPris: boolean) =>
  creerUnClientApi({
    leNomEstPris: async () => nomPris,
    genererUnSecret: () => ({ secret: 'secret', secretHash: 'empreinte' }),
    enregistrer: async () => client,
  })(definition)

describe('créer un client API', () => {
  it('rend le client créé et son secret', async () => {
    expect(await creer(false)).toEqual({
      success: true,
      data: { client, secret: 'secret' },
    })
  })

  it('refuse un nom déjà pris', async () => {
    expect(await creer(true)).toEqual({
      success: false,
      error: { _tag: 'NomDejaPris', nom: 'Tableau de bord' },
    })
  })
})
