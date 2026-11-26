import { describe, expect, it } from 'vitest'
import {
  ClientApiId,
  type PeriodeDeValidite,
  PorteeApi,
} from '@/features/clients-api/domain'
import { authentifierUnClientApi } from './authentifier-un-client-api'
import type { ClientApiAAuthentifier } from './ports'

const clientApiId = 'a1b2c3d4-0000-4000-8000-000000000001'

const maintenant = new Date('2026-10-26T12:00:00Z')

const client: ClientApiAAuthentifier = {
  id: ClientApiId(clientApiId),
  portees: [PorteeApi('Activites'), PorteeApi('Structures')],
  validite: { debut: new Date('2026-01-01'), fin: null },
  secretHash: 'empreinte',
}

const demande = {
  clientApiId,
  secret: 'secret',
  portees: [PorteeApi('Activites')],
  maintenant,
}

describe('authentifier un client API', () => {
  it('authentifie un client valide qui détient les portées demandées', async () => {
    expect(
      await authentifierUnClientApi({
        lireLeClientApiAAuthentifier: async () => client,
        verifierUnSecret: () => true,
      })(demande),
    ).toEqual({
      success: true,
      data: { clientApiId: ClientApiId(clientApiId) },
    })
  })

  it('n’autorise pas un client valide qui ne détient pas toutes les portées demandées', async () => {
    expect(
      await authentifierUnClientApi({
        lireLeClientApiAAuthentifier: async () => client,
        verifierUnSecret: () => true,
      })({
        ...demande,
        portees: [PorteeApi('Activites'), PorteeApi('Statistiques')],
      }),
    ).toEqual({ success: false, error: { _tag: 'NonAutorise' } })
  })

  it('n’authentifie pas un identifiant invalide', async () => {
    expect(
      await authentifierUnClientApi({
        lireLeClientApiAAuthentifier: async () => client,
        verifierUnSecret: () => true,
      })({ ...demande, clientApiId: 'inconnu' }),
    ).toEqual({ success: false, error: { _tag: 'NonAuthentifie' } })
  })

  it('n’authentifie pas un client inconnu', async () => {
    expect(
      await authentifierUnClientApi({
        lireLeClientApiAAuthentifier: async () => null,
        verifierUnSecret: () => true,
      })(demande),
    ).toEqual({ success: false, error: { _tag: 'NonAuthentifie' } })
  })

  it('n’authentifie pas un client dont le secret ne correspond pas', async () => {
    expect(
      await authentifierUnClientApi({
        lireLeClientApiAAuthentifier: async () => client,
        verifierUnSecret: () => false,
      })(demande),
    ).toEqual({ success: false, error: { _tag: 'NonAuthentifie' } })
  })

  it.each<{ cas: string; validite: PeriodeDeValidite }>([
    {
      cas: 'pas encore commencée',
      validite: { debut: new Date('2026-11-01'), fin: null },
    },
    {
      cas: 'finie',
      validite: { debut: new Date('2026-01-01'), fin: new Date('2026-06-30') },
    },
  ])(
    'n’authentifie pas un client dont la validité est $cas',
    async ({ validite }) => {
      expect(
        await authentifierUnClientApi({
          lireLeClientApiAAuthentifier: async () => ({ ...client, validite }),
          verifierUnSecret: () => true,
        })(demande),
      ).toEqual({ success: false, error: { _tag: 'NonAuthentifie' } })
    },
  )

  it('authentifie un client dont la validité est commencée et pas encore finie', async () => {
    expect(
      await authentifierUnClientApi({
        lireLeClientApiAAuthentifier: async () => ({
          ...client,
          validite: {
            debut: new Date('2026-01-01'),
            fin: new Date('2026-12-31'),
          },
        }),
        verifierUnSecret: () => true,
      })(demande),
    ).toEqual({
      success: true,
      data: { clientApiId: ClientApiId(clientApiId) },
    })
  })
})
