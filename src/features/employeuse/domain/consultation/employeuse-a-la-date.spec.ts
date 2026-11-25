import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { AdresseEmployeuse } from '../adresse-employeuse'
import { type Contrat } from '../affectation/contrat'
import { PeriodeEmploi } from '../affectation/periode-emploi'
import { DenominationEmployeuse } from '../denomination-employeuse'
import { type Employeuse } from '../employeuse'
import { EmployeuseId } from '../employeuse-id'
import { employeuseALaDate } from './employeuse-a-la-date'

const employeuseDeTest = (
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

const contrat = (
  employeuseId: number,
  dates: {
    debut?: Date | null
    fin?: Date | null
    rupture?: Date | null
    maintenant?: Date
  } = {},
): Contrat => ({
  employeuse: employeuseDeTest(employeuseId),
  periode: PeriodeEmploi({
    debut: dates.debut ?? null,
    fin: dates.fin ?? null,
    rupture: dates.rupture ?? null,
    maintenant: dates.maintenant ?? new Date('2100-01-01'),
  }),
})

const juin2026 = new Date('2026-06-01')

describe('employeuseALaDate', () => {
  it('retient l’employeuse du contrat qui couvre la date', () => {
    const employeuse = employeuseALaDate(
      employeuseDeTest(1),
      [
        contrat(10, {
          debut: new Date('2025-01-01'),
          fin: new Date('2025-12-31'),
        }),
        contrat(11, { debut: new Date('2026-01-01') }),
      ],
      new Date('2025-06-01'),
    )

    // La date de 2025 tombe sur le contrat de 2025, pas sur l'affectation active.
    expect(employeuse?.id).toBe(10)
  })

  it('retient le contrat toujours ouvert pour une date postérieure à son début', () => {
    const employeuse = employeuseALaDate(
      employeuseDeTest(1),
      [contrat(11, { debut: new Date('2026-01-01') })],
      juin2026,
    )
    expect(employeuse?.id).toBe(11)
  })

  it('retombe sur l’employeuse courante quand aucun contrat ne couvre la date', () => {
    const employeuse = employeuseALaDate(employeuseDeTest(1), [], juin2026)
    expect(employeuse?.id).toBe(1)
  })

  it('retombe sur l’employeuse courante pour une date antérieure à tout contrat', () => {
    const employeuse = employeuseALaDate(
      employeuseDeTest(1),
      [contrat(11, { debut: new Date('2026-01-01') })],
      new Date('2020-06-01'),
    )
    expect(employeuse?.id).toBe(1)
  })

  it('n’a pas d’employeuse sans affectation ni contrat', () => {
    expect(employeuseALaDate(null, [], juin2026)).toBeNull()
  })
})
