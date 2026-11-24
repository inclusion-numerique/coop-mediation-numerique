import { describe, expect, it } from 'vitest'
import { getServerBaseUrl } from '@/configuration/projet/base-url'
import { redirection } from './redirection.transfer'

const adresseAbsolue = (chemin: string): string =>
  new URL(`${getServerBaseUrl({ absolutePath: true })}${chemin}`).href

describe('redirection', () => {
  it('redirige vers le chemin sur l’adresse absolue de l’application', () => {
    expect(redirection('/coop/mes-outils').headers.get('location')).toBe(
      adresseAbsolue('/coop/mes-outils'),
    )
  })

  it('porte le motif dans les paramètres de la requête', () => {
    expect(
      redirection('/coop/mes-outils', {
        erreur: 'CodeAutorisationManquant',
        detail: 'accès refusé',
      }).headers.get('location'),
    ).toBe(
      adresseAbsolue(
        '/coop/mes-outils?erreur=CodeAutorisationManquant&detail=acc%C3%A8s+refus%C3%A9',
      ),
    )
  })

  it('répond par une redirection temporaire', () => {
    expect(redirection('/coop').status).toBe(307)
  })
})
