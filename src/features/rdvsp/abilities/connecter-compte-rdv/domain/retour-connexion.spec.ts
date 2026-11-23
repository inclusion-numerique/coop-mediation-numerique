import { describe, expect, it } from 'vitest'
import { JetonRevoque } from '../../../domain/errors'
import { CodeAutorisationRefuse } from './errors'
import {
  cheminDeRedirection,
  issuesDuRetour,
  motifDiagnostic,
} from './retour-connexion'

describe('motifDiagnostic', () => {
  it('détaille le motif d’un code d’autorisation refusé', () => {
    expect(motifDiagnostic(CodeAutorisationRefuse('invalid_client'))).toBe(
      'CodeAutorisationRefuse (invalid_client)',
    )
  })

  it('réduit les autres erreurs à leur tag', () => {
    expect(motifDiagnostic(JetonRevoque(null))).toBe('JetonRevoque')
  })
})

describe('cheminDeRedirection', () => {
  it('rend le chemin seul sans motif', () => {
    expect(cheminDeRedirection('/coop/mes-outils')).toBe('/coop/mes-outils')
  })

  it('ajoute le motif en paramètres d’URL', () => {
    expect(
      cheminDeRedirection('/coop/mes-outils', {
        error: 'invalid_oauth_code',
        error_description: 'Le code est manquant',
      }),
    ).toBe(
      '/coop/mes-outils?error=invalid_oauth_code&error_description=Le+code+est+manquant',
    )
  })
})

describe('issuesDuRetour', () => {
  it('reprend les destinations demandées', () => {
    expect(
      issuesDuRetour({
        redirectToSuccess: '/coop/succes',
        redirectToError: '/coop/echec',
      }),
    ).toEqual({ succes: '/coop/succes', echec: '/coop/echec' })
  })

  it('revient à la coop sans destination demandée', () => {
    expect(issuesDuRetour({})).toEqual({ succes: '/coop', echec: '/coop' })
  })
})
