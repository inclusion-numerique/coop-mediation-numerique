import { AdresseEmployeuse } from './adresse-employeuse'
import type { Affectation } from './affectation'
import type { Contrat } from './contrat'
import { DenominationEmployeuse } from './denomination-employeuse'
import type { Employeuse } from './employeuse'
import { EmployeuseId } from './employeuse-id'
import { PeriodeEmploi } from './periode-emploi'
import { Siret } from './siret'
import { SourceAffectation } from './source-affectation'

/** Employeuse de test, construite par les constructeurs du domaine (jamais par `as`). */
export const employeuse = (
  id: number,
  overrides: Partial<Employeuse> = {},
): Employeuse => ({
  id: EmployeuseId(id),
  denomination: DenominationEmployeuse(`Structure ${id}`),
  siret: Siret(`${id}`.padStart(14, '9')),
  rna: null,
  adresse: AdresseEmployeuse({
    voie: '12 rue des Tests',
    codePostal: '44000',
    codeInsee: '44109',
    commune: 'Nantes',
  }),
  contactReferent: { _tag: 'nonRenseigne' },
  ...overrides,
})

export const affectation = (
  source: string,
  employeuseId: number,
  depuis: Date | null = new Date('2026-01-01'),
): Affectation => ({
  employeuse: employeuse(employeuseId),
  source: SourceAffectation(source),
  depuis,
})

export const contrat = (
  employeuseId: number,
  dates: { debut?: Date | null; fin?: Date | null; rupture?: Date | null } = {},
): Contrat => ({
  employeuseId: EmployeuseId(employeuseId),
  periode: PeriodeEmploi({
    debut: dates.debut ?? null,
    fin: dates.fin ?? null,
    rupture: dates.rupture ?? null,
  }),
})
