import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { meriteUneNouvelleTentative } from './get-avec-nouvelles-tentatives'

const reponse = (status: number) =>
  new AxiosError('échec', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: null,
  })

describe('une requête mérite une nouvelle tentative', () => {
  it('après une erreur réseau, sans réponse du serveur', () => {
    expect(
      meriteUneNouvelleTentative(new AxiosError('réseau', 'ECONNRESET')),
    ).toBe(true)
  })

  it('après une erreur du serveur', () => {
    expect(meriteUneNouvelleTentative(reponse(503))).toBe(true)
  })

  it('pas après une erreur du client', () => {
    expect(meriteUneNouvelleTentative(reponse(404))).toBe(false)
  })

  it("pas après une erreur qui ne vient pas d'axios", () => {
    expect(meriteUneNouvelleTentative(new Error('autre'))).toBe(false)
  })
})
