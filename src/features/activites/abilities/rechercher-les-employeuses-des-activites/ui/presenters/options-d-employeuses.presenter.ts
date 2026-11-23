import type { EmployeuseDesActivites } from '../../../../domain'
import type { OptionDEmployeuse } from '../../../../ui/presenters/filtres/filtres-de-la-liste.search-params'

export const optionsDEmployeuses = (
  employeuses: readonly EmployeuseDesActivites[],
): OptionDEmployeuse[] =>
  employeuses.map(({ id, nom, commune }) => ({
    id: String(id),
    nom: nom ?? '',
    commune,
  }))
