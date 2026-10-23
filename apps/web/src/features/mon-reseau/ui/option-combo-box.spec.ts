import { optionsFiltrees } from './option-combo-box'

describe('options filtrées à la frappe', () => {
  it('compare sans accents ni casse', () => {
    expect(
      optionsFiltrees(
        [
          { value: '56121', label: 'Lorient · 56100' },
          { value: '02168', label: 'Château-Thierry · 02400' },
        ],
        'chateau',
      ),
    ).toEqual([{ value: '02168', label: 'Château-Thierry · 02400' }])
  })
})
