import { describe, expect, it } from 'vitest'
import { optionsRecherchees } from './options-recherchees'

const option = (label: string) => ({ value: label, label })

describe('options recherchées', () => {
  it('trouvent une option par son libellé, sans tenir compte des accents', () => {
    expect(
      optionsRecherchees([option('Évry'), option('Lyon')], 'evr').map(
        ({ label }) => label,
      ),
    ).toStrictEqual(['Évry'])
  })

  it('ne rendent que les dix premières', () => {
    expect(
      optionsRecherchees(
        Array.from({ length: 12 }, (_, rang) => option(`Ville ${rang}`)),
        'ville',
      ),
    ).toHaveLength(10)
  })
})
