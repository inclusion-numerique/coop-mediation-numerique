import { describe, expect, it } from 'vitest'
import {
  type ClientApi,
  ClientApiId,
  NomDuClientApi,
  PorteeApi,
} from '@/features/clients-api/domain'
import { consulterUnClientApi } from './consulter-un-client-api'

const clientApiId = 'a1b2c3d4-0000-4000-8000-000000000001'

const client: ClientApi = {
  id: ClientApiId(clientApiId),
  nom: NomDuClientApi('Tableau de bord'),
  portees: [PorteeApi('Activites')],
  validite: { debut: new Date('2026-01-01T00:00:00.000Z'), fin: null },
  creeLe: new Date('2026-01-01T00:00:00.000Z'),
  modifieLe: new Date('2026-01-01T00:00:00.000Z'),
}

describe('consulter un client API', () => {
  it('rend le client API demandé', async () => {
    expect(
      await consulterUnClientApi({ lireLeClientApi: async () => client })(
        clientApiId,
      ),
    ).toEqual({ success: true, data: client })
  })

  it.each<{ cas: string; lu: ClientApi | null; identifiant: string }>([
    { cas: 'l’identifiant est invalide', lu: client, identifiant: 'inconnu' },
    { cas: 'aucun client ne le porte', lu: null, identifiant: clientApiId },
  ])(
    'signale un client API introuvable quand $cas',
    async ({ lu, identifiant }) => {
      expect(
        await consulterUnClientApi({ lireLeClientApi: async () => lu })(
          identifiant,
        ),
      ).toEqual({
        success: false,
        error: { _tag: 'ClientApiIntrouvable', clientApiId: identifiant },
      })
    },
  )
})
