import { describe, expect, it } from 'vitest'
import { libelleDesResultats } from './libelles-des-filtres.presenter'

describe('étiquettes des filtres de l’annuaire des lieux', () => {
  it.each([
    [0, false, 'Aucun lieu référencé'],
    [0, true, 'Aucun lieu ne correspond à votre recherche'],
    [1, false, '1 lieu'],
    [3, true, '3 lieux'],
  ])('annonce %i résultat(s), filtré : %s', (total, filtre, attendu) => {
    expect(libelleDesResultats(total, filtre)).toBe(attendu)
  })
})
