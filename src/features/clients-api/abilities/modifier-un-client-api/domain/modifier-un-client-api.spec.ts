import { describe, expect, it } from 'vitest'
import {
  type ClientApi,
  ClientApiId,
  type DefinitionDuClientApi,
  NomDuClientApi,
  PorteeApi,
} from '@/features/clients-api/domain'
import { modifierUnClientApi } from './modifier-un-client-api'

const clientApiId = 'a1b2c3d4-0000-4000-8000-000000000001'

const definition: DefinitionDuClientApi = {
  nom: NomDuClientApi('Tableau de bord'),
  portees: [PorteeApi('Activites'), PorteeApi('Statistiques')],
  validite: { debut: new Date('2026-01-01T00:00:00.000Z'), fin: null },
}

const client: ClientApi = {
  ...definition,
  id: ClientApiId(clientApiId),
  creeLe: new Date('2026-01-01T00:00:00.000Z'),
  modifieLe: new Date('2026-02-01T00:00:00.000Z'),
}

const modifier = ({
  existe,
  nomPris,
  identifiant,
}: {
  existe: boolean
  nomPris: boolean
  identifiant: string
}) =>
  modifierUnClientApi({
    clientApiExiste: async () => existe,
    leNomEstPris: async () => nomPris,
    enregistrer: async () => client,
  })({ clientApiId: identifiant, definition })

describe('modifier un client API', () => {
  it('rend le client modifié', async () => {
    expect(
      await modifier({
        existe: true,
        nomPris: false,
        identifiant: clientApiId,
      }),
    ).toEqual({ success: true, data: client })
  })

  it('refuse un nom déjà pris par un autre client', async () => {
    expect(
      await modifier({ existe: true, nomPris: true, identifiant: clientApiId }),
    ).toEqual({
      success: false,
      error: { _tag: 'NomDejaPris', nom: 'Tableau de bord' },
    })
  })

  it.each<{ cas: string; existe: boolean; identifiant: string }>([
    { cas: 'l’identifiant est invalide', existe: true, identifiant: 'inconnu' },
    {
      cas: 'aucun client ne le porte',
      existe: false,
      identifiant: clientApiId,
    },
  ])(
    'signale un client API introuvable quand $cas',
    async ({ existe, identifiant }) => {
      expect(await modifier({ existe, nomPris: false, identifiant })).toEqual({
        success: false,
        error: { _tag: 'ClientApiIntrouvable', clientApiId: identifiant },
      })
    },
  )
})
