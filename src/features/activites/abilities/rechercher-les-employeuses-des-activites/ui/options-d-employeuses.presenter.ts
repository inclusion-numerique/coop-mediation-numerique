import type { EmployeuseDesActivites } from '../../../domain'
import type { OptionDEmployeuse } from '../../../ui/filtres/filtres-de-la-liste'

export const optionsDEmployeuses = (
  employeuses: readonly EmployeuseDesActivites[],
): OptionDEmployeuse[] =>
  employeuses.map(({ id, nom, commune }) => ({
    id: String(id),
    nom: nom ?? '',
    commune,
  }))
