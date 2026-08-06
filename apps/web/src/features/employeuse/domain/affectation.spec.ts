import { affectationActuelle } from './affectation'
import { affectation } from './employeuse.fixture'

describe('affectationActuelle', () => {
  it('priorise idposte sur coop — le dispositif fait autorité', () => {
    const actuelle = affectationActuelle([
      affectation('coop', 1),
      affectation('idposte', 2),
    ])
    expect(actuelle?.employeuse.id).toBe(2)
  })

  it('retombe sur coop quand il n’y a pas d’idposte', () => {
    const actuelle = affectationActuelle([
      affectation('aidants-connect', 3),
      affectation('coop', 1),
    ])
    expect(actuelle?.employeuse.id).toBe(1)
  })

  it('à source égale, retient la plus récemment enregistrée', () => {
    const actuelle = affectationActuelle([
      affectation('coop', 1, new Date('2025-01-01')),
      affectation('coop', 2, new Date('2026-06-01')),
    ])
    expect(actuelle?.employeuse.id).toBe(2)
  })

  it('n’a pas d’employeuse courante sans affectation', () => {
    expect(affectationActuelle([])).toBeNull()
  })
})
