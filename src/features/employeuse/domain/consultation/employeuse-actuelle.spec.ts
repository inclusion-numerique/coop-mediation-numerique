import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { AdresseEmployeuse } from '../adresse-employeuse'
import { type Contrat } from '../affectation/contrat'
import { PeriodeEmploi } from '../affectation/periode-emploi'
import { SourceAffectation } from '../affectation/source-affectation'
import { DenominationEmployeuse } from '../denomination-employeuse'
import { type Employeuse } from '../employeuse'
import { EmployeuseId } from '../employeuse-id'
import {
  type AffectationActuelle,
  employeuseActuelle,
} from './employeuse-actuelle'

const employeuse = (
  id: number,
  overrides: Partial<Employeuse> = {},
): Employeuse => ({
  id: EmployeuseId(id),
  denomination: DenominationEmployeuse(`Structure ${id}`),
  denominationSirene: DenominationEmployeuse(`Structure ${id}`),
  siret: Siret(`${id}`.padStart(14, '9')),
  rna: null,
  adresse: AdresseEmployeuse({
    voie: '12 rue des Tests',
    codePostal: '44000',
    codeInsee: '44109',
    commune: 'Nantes',
  }),
  contactReferent: { _tag: 'nonRenseigne' },
  creation: null,
  modification: null,
  suppression: null,
  ...overrides,
})

const affectationActuelle = (
  source: string,
  employeuseId: number,
): AffectationActuelle => ({
  employeuse: employeuse(employeuseId),
  source: SourceAffectation(source),
})

const contrat = (
  employeuseId: number,
  dates: {
    debut?: Date | null
    fin?: Date | null
    rupture?: Date | null
    maintenant?: Date
  } = {},
): Contrat => ({
  employeuse: employeuse(employeuseId),
  periode: PeriodeEmploi({
    debut: dates.debut ?? null,
    fin: dates.fin ?? null,
    rupture: dates.rupture ?? null,
    maintenant: dates.maintenant ?? new Date('2100-01-01'),
  }),
})

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
