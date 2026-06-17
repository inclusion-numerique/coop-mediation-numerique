import { ContactTelephone } from './contact-telephone'
import { Telephone } from './telephone'

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

  it('builds a nonRenseigne contact when nothing is provided', () => {
    expect(ContactTelephone(undefined, undefined)).toEqual({
      _tag: 'nonRenseigne',
    })
    expect(ContactTelephone(undefined, false)).toEqual({
      _tag: 'nonRenseigne',
    })
    expect(ContactTelephone(undefined, null)).toEqual({
      _tag: 'nonRenseigne',
    })
  })
})
