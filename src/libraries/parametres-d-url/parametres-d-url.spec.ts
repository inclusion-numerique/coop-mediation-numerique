import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { adresseAvec, valeursLues } from './parametres-d-url'

const Chiffre = z.enum(['1', '2', '3'])

describe('paramètres d’URL', () => {
  it.each([
    ['une liste séparée par des virgules', '1, 2,3', ['1', '2', '3']],
    ['un paramètre répété', ['1', '2,3'], ['1', '2', '3']],
    ['des éléments vides', ',1,,', ['1']],
    ['des éléments invalides', "1,9,2') OR 1=1 --", ['1']],
    ['une chaîne vide', '', []],
    ['un paramètre absent', undefined, []],
  ])('lit %s', (_, valeur, attendu) => {
    expect(valeursLues(Chiffre, valeur)).toEqual(attendu)
  })

  it('ajoute des paramètres à une adresse sans requête', () => {
    expect(
      adresseAvec('/coop/mes-activites/cra/collectif', {
        retour: '/coop/mes-activites?tags=a&du=2026-09-01',
      }),
    ).toBe(
      '/coop/mes-activites/cra/collectif?retour=%2Fcoop%2Fmes-activites%3Ftags%3Da%26du%3D2026-09-01',
    )
  })

  it('fusionne avec les paramètres déjà présents', () => {
    expect(adresseAvec('/saisie?retour=%2Fliste', { v: 'etat' })).toBe(
      '/saisie?retour=%2Fliste&v=etat',
    )
  })

  it('ignore les paramètres absents', () => {
    expect(adresseAvec('/saisie', { retour: undefined, v: null })).toBe(
      '/saisie',
    )
  })
})
