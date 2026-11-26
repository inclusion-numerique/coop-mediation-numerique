import { describe, expect, it } from 'vitest'
import { PresenceDeCrasV1 } from '../../domain'
import { presenceDeCrasV1Presentee } from './presence-de-cras-v1.presenter'

describe('présence de CRA v1 présentée', () => {
  it.each<{
    readonly cas: string
    readonly presence: PresenceDeCrasV1
    readonly attendue: boolean
  }>([
    {
      cas: 'propose le filtre de source quand des CRA v1 sont présents',
      presence: PresenceDeCrasV1('Presents'),
      attendue: true,
    },
    {
      cas: 'ne propose pas le filtre de source sans CRA v1',
      presence: PresenceDeCrasV1('Absents'),
      attendue: false,
    },
  ])('$cas', ({ presence, attendue }) => {
    expect(
      presenceDeCrasV1Presentee({ success: true, data: presence }),
    ).toEqual({
      hasCrasV1: attendue,
    })
  })
})
