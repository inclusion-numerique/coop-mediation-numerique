import { describe, expect, it } from 'vitest'
import { getServerBaseUrl } from '@/configuration/projet/base-url'
import { proConnectHostname } from './proconnect.client'
import { generateProconnectSignoutUrl } from './proconnect-signout.transfer'

const adresse = new URL(
  generateProconnectSignoutUrl({
    idTokenHint: 'jeton-d-identite',
    callbackUrl: '/coop/mes-activites',
  }),
)

describe('generateProconnectSignoutUrl', () => {
  it('pointe vers le serveur ProConnect', () => {
    expect(adresse.origin).toBe(new URL(`https://${proConnectHostname}`).origin)
  })

  it('pointe vers la fin de session de ProConnect', () => {
    expect(adresse.pathname).toBe('/api/v2/session/end')
  })

  it('transmet le jeton d’identité', () => {
    expect(adresse.searchParams.get('id_token_hint')).toBe('jeton-d-identite')
  })

  it('demande le retour sur le rappel de déconnexion de l’application', () => {
    expect(adresse.searchParams.get('post_logout_redirect_uri')).toBe(
      `${getServerBaseUrl({ absolutePath: true })}/deconnexion/callback`,
    )
  })

  it('ne transmet ni état ni adresse de retour demandée', () => {
    expect([...adresse.searchParams.keys()]).toEqual([
      'post_logout_redirect_uri',
      'id_token_hint',
    ])
  })
})
