import { laReponseEstNegative } from './identite-sirene'

/**
 * Ce que ce discernement décide : un SIRET jugé inconnu est effacé du lieu.
 * Le confondre avec une panne suffirait à vider les colonnes `siret` que la
 * passe de nuit atteint pendant une indisponibilité de l'annuaire.
 */
describe('la réponse de l’annuaire des entreprises', () => {
  it('est négative quand le SIRET ne figure pas dans les résultats', () => {
    expect(laReponseEstNegative({ statusCode: 404 })).toBe(true)
  })

  it('n’en est pas une quand l’annuaire est en panne', () => {
    expect(laReponseEstNegative({ statusCode: 500 })).toBe(false)
  })

  it('n’en est pas une quand la requête a échoué sans réponse', () => {
    expect(laReponseEstNegative({ statusCode: 0 })).toBe(false)
  })
})
