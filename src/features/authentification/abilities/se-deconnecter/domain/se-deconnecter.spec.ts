import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { RafraichissementImpossible } from './errors'
import type { JetonsProconnect } from './ports'
import { seDeconnecter } from './se-deconnecter'

const maintenant = new Date('2027-01-15T08:00:00.000Z')

const utilisateurId = 'a3c1c0d2-5b7e-4f7a-9d1e-2f8b6c4d0e11'

const sansJeton: JetonsProconnect = { idToken: null, refreshToken: null }

describe('se déconnecter', () => {
  it('se déconnecte auprès de ProConnect avec un id token qui expire au-delà de la marge', async () => {
    expect(
      await seDeconnecter({
        lireLesJetonsProconnect: async () => ({
          idToken: {
            valeur: 'id-token',
            expiration: new Date('2027-01-15T08:01:00.000Z'),
          },
          refreshToken: null,
        }),
        rafraichirLIdToken: async () => success('id-token-rafraichi'),
      })({ utilisateurId, maintenant }),
    ).toEqual({
      success: true,
      data: { _tag: 'AupresDeProConnect', idTokenHint: 'id-token' },
    })
  })

  it.each<{ cas: string; jetons: JetonsProconnect }>([
    {
      cas: 'expire dans la marge de décalage d’horloge',
      jetons: {
        idToken: {
          valeur: 'id-token',
          expiration: new Date('2027-01-15T08:00:03.000Z'),
        },
        refreshToken: 'refresh-token',
      },
    },
    {
      cas: 'n’a pas d’expiration lisible',
      jetons: {
        idToken: { valeur: 'id-token', expiration: null },
        refreshToken: 'refresh-token',
      },
    },
    {
      cas: 'manque',
      jetons: { idToken: null, refreshToken: 'refresh-token' },
    },
  ])(
    'se déconnecte auprès de ProConnect avec un id token rafraîchi quand l’id token $cas',
    async ({ jetons }) => {
      expect(
        await seDeconnecter({
          lireLesJetonsProconnect: async () => jetons,
          rafraichirLIdToken: async () => success('id-token-rafraichi'),
        })({ utilisateurId, maintenant }),
      ).toEqual({
        success: true,
        data: { _tag: 'AupresDeProConnect', idTokenHint: 'id-token-rafraichi' },
      })
    },
  )

  it('se déconnecte localement quand le rafraîchissement échoue', async () => {
    expect(
      await seDeconnecter({
        lireLesJetonsProconnect: async () => ({
          idToken: null,
          refreshToken: 'refresh-token',
        }),
        rafraichirLIdToken: async () => failure(RafraichissementImpossible()),
      })({ utilisateurId, maintenant }),
    ).toEqual({ success: true, data: { _tag: 'Locale' } })
  })

  it('se déconnecte localement sans jeton ProConnect', async () => {
    expect(
      await seDeconnecter({
        lireLesJetonsProconnect: async () => sansJeton,
        rafraichirLIdToken: async () => success('id-token-rafraichi'),
      })({ utilisateurId, maintenant }),
    ).toEqual({ success: true, data: { _tag: 'Locale' } })
  })
})
