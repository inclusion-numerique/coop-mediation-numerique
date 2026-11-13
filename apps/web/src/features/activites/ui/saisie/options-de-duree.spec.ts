import { optionsDeDuree } from './options-de-duree'

describe('options de durée', () => {
  it('propose les durées par défaut triées, « Personnaliser » en dernier', () => {
    expect(
      optionsDeDuree({ dureesFrequentes: [] }).map(({ value }) => value),
    ).toEqual(['15', '30', '45', '60', '90', '120', 'personnaliser'])
  })

  it('ajoute les durées fréquentes du médiateur à leur place', () => {
    expect(
      optionsDeDuree({ dureesFrequentes: [75, 30] }).map(({ value }) => value),
    ).toEqual(['15', '30', '45', '60', '75', '90', '120', 'personnaliser'])
  })

  it('inclut la durée de l’activité modifiée', () => {
    expect(
      optionsDeDuree({ dureesFrequentes: [], incluse: '50' }).map(
        ({ value }) => value,
      ),
    ).toContain('50')
  })
})
