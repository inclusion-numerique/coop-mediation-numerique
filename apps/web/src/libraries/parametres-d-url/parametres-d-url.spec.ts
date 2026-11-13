import { z } from 'zod'
import {
  adresseAvec,
  periodeLue,
  premiereValeur,
  valeurLue,
  valeursLues,
} from './parametres-d-url'

const Chiffre = z.enum(['1', '2', '3'])

describe('paramètres d’URL', () => {
  it('prend la première valeur d’un paramètre répété', () => {
    expect(premiereValeur(['a', 'b'])).toBe('a')
    expect(premiereValeur('a')).toBe('a')
    expect(premiereValeur(undefined)).toBeUndefined()
  })

  it('lit une valeur valide et écarte une valeur invalide', () => {
    expect(valeurLue(Chiffre, '2')).toBe('2')
    expect(valeurLue(Chiffre, '9')).toBeNull()
    expect(valeurLue(Chiffre, undefined)).toBeNull()
  })

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

  it('lit une période dont le début précède la fin', () => {
    expect(periodeLue('2026-01-01', '2026-01-31')).toEqual({
      du: new Date('2026-01-01'),
      au: new Date('2026-01-31'),
    })
  })

  it.each([
    ['un début absent', undefined, '2026-01-31'],
    ['une fin absente', '2026-01-01', undefined],
    ['une date mal formée', '2026-13-01', '2026-01-31'],
    ['un début après la fin', '2026-02-01', '2026-01-31'],
  ])('écarte une période avec %s', (_, du, au) => {
    expect(periodeLue(du, au)).toBeNull()
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
