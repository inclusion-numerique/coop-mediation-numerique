import { describe, expect, it } from 'vitest'
import { montreLEquipe } from './proprietaire-du-partage'

describe('propriétaire du partage', () => {
  it('montre son équipe quand il partage en coordinateur', () => {
    expect(montreLEquipe({ _tag: 'Coordinateur' })).toBe(true)
  })

  it('ne montre pas d’équipe quand il partage en médiateur', () => {
    expect(montreLEquipe({ _tag: 'Mediateur' })).toBe(false)
  })
})
