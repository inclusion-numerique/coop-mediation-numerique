import { describe, expect, it } from 'vitest'
import {
  ClientApiId,
  type DefinitionDuClientApi,
  NomDejaPris,
  NomDuClientApi,
  PorteeApi,
} from '@/features/clients-api/domain'
import { modifierUnClientApi } from './modifier-un-client-api'

const clientApiId = ClientApiId('a1b2c3d4-0000-4000-8000-000000000001')

const maintenant = new Date('2026-11-26T10:00:00.000Z')

const definition: DefinitionDuClientApi = {
  nom: NomDuClientApi('Tableau de bord'),
  portees: [PorteeApi('Activites'), PorteeApi('Statistiques')],
  validite: { debut: new Date('2026-01-01T00:00:00.000Z'), fin: null },
}

const modifier = ({
  existe,
  nomPris,
  identifiant,
}: {
  existe: boolean
  nomPris: boolean
  identifiant: ClientApiId | null
}) =>
  modifierUnClientApi({
    clientApiExiste: async () => existe,
    leNomEstPris: async () => nomPris,
    enregistrer: async () => undefined,
  })({ clientApiId: identifiant, definition, maintenant })

describe('modifier un client API', () => {
  it('enregistre la nouvelle définition du client à l’instant de la modification', async () => {
    expect(
      await modifier({
        existe: true,
        nomPris: false,
        identifiant: clientApiId,
      }),
    ).toEqual({
      success: true,
      data: { id: clientApiId, definition, maintenant },
    })
  })

  it('refuse un nom déjà pris par un autre client', async () => {
    expect(
      await modifier({ existe: true, nomPris: true, identifiant: clientApiId }),
    ).toEqual({
      success: false,
      error: NomDejaPris(NomDuClientApi('Tableau de bord')),
    })
  })

  it.each<{
    cas: string
    existe: boolean
    identifiant: ClientApiId | null
  }>([
    { cas: 'l’identifiant est invalide', existe: true, identifiant: null },
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
        error: { _tag: 'ClientApiIntrouvable' },
      })
    },
  )
})
