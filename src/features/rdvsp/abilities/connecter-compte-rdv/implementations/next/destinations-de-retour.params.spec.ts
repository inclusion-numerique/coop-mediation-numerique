import { describe, expect, it } from 'vitest'
import { encodeSerializableState } from '@/libraries/etat-encode'
import { destinationsDeRetour } from './destinations-de-retour.params'

describe('destinations de retour lues dans l’état OAuth', () => {
  it('lit les destinations encodées au départ de la liaison', () => {
    expect(
      destinationsDeRetour(
        encodeSerializableState({
          redirectToSuccess: '/coop/succes',
          redirectToError: '/coop/erreur',
        }),
      ),
    ).toEqual({
      redirectToSuccess: '/coop/succes',
      redirectToError: '/coop/erreur',
    })
  })

  it('ne retient aucune destination d’un état illisible', () => {
    expect(destinationsDeRetour('illisible')).toEqual({})
  })

  it('ne retient aucune destination d’un état qui n’en porte pas', () => {
    expect(
      destinationsDeRetour(encodeSerializableState({ redirectToSuccess: 42 })),
    ).toEqual({})
  })
})
