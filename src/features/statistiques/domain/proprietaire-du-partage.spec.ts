import { describe, expect, it } from 'vitest'
import { coordinationDuPartage } from './proprietaire-du-partage'

const coordination = { equipe: ['membre'] }

describe('coordination du partage', () => {
  it('garde la coordination quand le propriétaire partage en coordinateur', () => {
    expect(coordinationDuPartage({ _tag: 'Coordinateur' }, coordination)).toBe(
      coordination,
    )
  })

  it('efface la coordination quand le propriétaire partage en médiateur', () => {
    expect(
      coordinationDuPartage({ _tag: 'Mediateur' }, coordination),
    ).toBeNull()
  })
})
