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
