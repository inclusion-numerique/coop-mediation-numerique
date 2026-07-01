import {
  ADRESSE_SIMILARITY_THRESHOLD,
  diceSimilarity,
  NOM_SIMILARITY_THRESHOLD,
} from './siretIdentity'

describe('diceSimilarity', () => {
  it('renvoie 1 pour deux chaînes identiques (après normalisation)', () => {
    expect(diceSimilarity('Mairie de Paris', 'MAIRIE DE PARIS')).toBe(1)
    expect(diceSimilarity('Café des Sports', 'cafe des sports')).toBe(1)
  })

  it('renvoie un score faible pour deux chaînes disjointes', () => {
    expect(diceSimilarity('Médiathèque Nord', 'Boulangerie Zulu')).toBeLessThan(
      0.3,
    )
  })

  it('renvoie un score élevé pour une variation mineure', () => {
    expect(
      diceSimilarity('Association Numérique', 'Association Numerique'),
    ).toBeGreaterThan(NOM_SIMILARITY_THRESHOLD)
  })

  it('gère les chaînes trop courtes sans planter', () => {
    expect(diceSimilarity('a', 'b')).toBe(0)
    expect(diceSimilarity('', '')).toBe(1)
  })

  it('expose des seuils cohérents (nom plus strict que adresse)', () => {
    expect(NOM_SIMILARITY_THRESHOLD).toBeGreaterThan(
      ADRESSE_SIMILARITY_THRESHOLD,
    )
  })
})
