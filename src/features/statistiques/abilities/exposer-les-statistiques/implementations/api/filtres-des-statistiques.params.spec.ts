import { describe, expect, it } from 'vitest'
import { FiltresDesStatistiquesValidation } from './filtres-des-statistiques.params'

const departements = (valeur: string | string[]) =>
  FiltresDesStatistiquesValidation.parse({ departements: valeur }).departements

describe('lecture des listes de filtres des statistiques', () => {
  it.each([
    ['une liste séparée par des virgules', '01, 02,69', ['01', '02', '69']],
    ['un paramètre répété', ['01', '02,69'], ['01', '02', '69']],
    ['des éléments vides', ',01,,', ['01']],
    ['des éléments invalides', "01,ZZ,02') OR 1=1 --", ['01']],
    ['une chaîne vide', '', []],
  ])('lit %s', (_, valeur, attendu) => {
    expect(departements(valeur)).toEqual(attendu)
  })
})
