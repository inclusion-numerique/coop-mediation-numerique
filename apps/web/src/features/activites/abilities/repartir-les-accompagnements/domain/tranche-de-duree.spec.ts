import { bornesEnMinutes, tranchesDeDuree } from './tranche-de-duree'

describe('tranches de durée', () => {
  it('se suivent sans trou ni chevauchement, de 0 minute à l’infini', () => {
    const bornes = tranchesDeDuree.map(bornesEnMinutes)
    expect(bornes.at(0)?.depuis).toBe(0)
    expect(bornes.at(-1)?.jusqua).toBeNull()
    expect(
      bornes
        .slice(1)
        .every(({ depuis }, rang) => depuis === bornes[rang]?.jusqua),
    ).toBe(true)
  })
})
