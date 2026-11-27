import { describe, expect, it } from 'vitest'
import { Telephone } from '@/libraries/telephone'
import { ContactTelephone } from './contact-telephone'

describe('ContactTelephone', () => {
  it('builds a disponible contact when a telephone is provided', () => {
    expect(ContactTelephone(Telephone('0102030405'), undefined)).toEqual({
      _tag: 'disponible',
      numero: '+33102030405',
    })
  })

  it('builds a disponible contact even if pasDeTelephone is set', () => {
    expect(ContactTelephone(Telephone('0102030405'), true)).toEqual({
      _tag: 'disponible',
      numero: '+33102030405',
    })
  })

  it('builds a pasDeTelephone contact when the flag is set and no number', () => {
    expect(ContactTelephone(undefined, true)).toEqual({
      _tag: 'pasDeTelephone',
    })
  })

  it.each<{ cas: string; pasDeTelephone: boolean | null | undefined }>([
    { cas: 'undefined', pasDeTelephone: undefined },
    { cas: 'false', pasDeTelephone: false },
    { cas: 'null', pasDeTelephone: null },
  ])(
    'builds a nonRenseigne contact without number and a $cas flag',
    ({ pasDeTelephone }) => {
      expect(ContactTelephone(undefined, pasDeTelephone)).toEqual({
        _tag: 'nonRenseigne',
      })
    },
  )
})
