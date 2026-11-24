import type { SelectOption } from '@/libraries/ui/components/form/utils/options'
import type { OptionDEmployeuse } from '../../../../action/rechercher-employeuses.key'
import type { EmployeuseDesActivites } from '../../../../domain'

export const optionsDEmployeuses = (
  employeuses: readonly EmployeuseDesActivites[],
): OptionDEmployeuse[] =>
  employeuses.map(({ id, nom, commune }) => ({
    id: String(id),
    nom: nom ?? '',
    commune,
  }))

export const employeusesEnOptions = (
  employeuses: readonly EmployeuseDesActivites[],
): readonly SelectOption[] =>
  optionsDEmployeuses(employeuses).map(({ id, nom, commune }) => ({
    value: id,
    label: commune === null ? nom : `${nom} · ${commune}`,
  }))
