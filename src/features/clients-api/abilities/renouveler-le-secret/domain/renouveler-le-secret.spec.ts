import { describe, expect, it } from 'vitest'
import { ClientApiId } from '@/features/clients-api/domain'
import { renouvelerLeSecret } from './renouveler-le-secret'

const clientApiId = ClientApiId('a1b2c3d4-0000-4000-8000-000000000001')

const renouveler = (existe: boolean, identifiant: ClientApiId | null) =>
  renouvelerLeSecret({
    clientApiExiste: async () => existe,
    genererUnSecret: () => ({
      secret: 'nouveau-secret',
      secretHash: 'empreinte',
    }),
    enregistrer: async () => undefined,
  })({ clientApiId: identifiant })

describe('renouveler le secret d’un client API', () => {
  it('rend le nouveau secret du client API', async () => {
    expect(await renouveler(true, clientApiId)).toEqual({
      success: true,
      data: {
        clientApiId,
        secret: 'nouveau-secret',
        secretHash: 'empreinte',
      },
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
      expect(await renouveler(existe, identifiant)).toEqual({
        success: false,
        error: { _tag: 'ClientApiIntrouvable' },
      })
    },
  )
})
