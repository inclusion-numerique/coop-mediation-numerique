import { describe, expect, it } from 'vitest'
import {
  actuelle as affectationActuelle,
  contrat,
} from '../../fixtures/domaine'
import { employeuseActuelle } from './employeuse-actuelle'

describe('employeuseActuelle', () => {
  it('retient la période du contrat de l’employeuse actuelle', () => {
    const actuelle = employeuseActuelle(affectationActuelle('idposte', 2), [
      contrat(1, { debut: new Date('2020-01-01') }),
      contrat(2, {
        debut: new Date('2026-03-01'),
        fin: new Date('2026-09-01'),
      }),
    ])

    expect(actuelle?.employeuse.id).toBe(2)
    expect(actuelle?.source).toBe('idposte')
    expect(actuelle?.periode).toEqual({
      _tag: 'terminee',
      debut: new Date('2026-03-01'),
      fin: new Date('2026-09-01'),
    })
  })

  // ~53 % des affectations de source coop n'ont aucun contrat (ADR-002) : c'est
  // l'état « inconnue », et non un emploi commencé à une date nulle.
  it('rend la période inconnue quand aucun contrat ne couvre l’employeuse', () => {
    const actuelle = employeuseActuelle(affectationActuelle('coop', 1), [])
    expect(actuelle?.employeuse.id).toBe(1)
    expect(actuelle?.periode).toEqual({ _tag: 'inconnue' })
  })

  it('ignore un contrat qui vise une autre employeuse', () => {
    const actuelle = employeuseActuelle(affectationActuelle('coop', 1), [
      contrat(2, { debut: new Date('2026-03-01') }),
    ])
    expect(actuelle?.periode).toEqual({ _tag: 'inconnue' })
  })

  it('n’a pas d’employeuse sans affectation active', () => {
    expect(employeuseActuelle(null, [])).toBeNull()
  })
})
