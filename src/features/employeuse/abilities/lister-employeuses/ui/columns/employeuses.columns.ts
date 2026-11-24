import type { ColonneDesEmployeuses } from '../../domain/lister-employeuses'

export type EmployeuseColumn =
  | { readonly tri: ColonneDesEmployeuses }
  | { readonly label: string }

export const employeusesColumns: readonly EmployeuseColumn[] = [
  { tri: 'nom' },
  { label: 'SIRET' },
  { label: 'Adresse' },
  { label: 'Commune' },
  { tri: 'emplois' },
  { tri: 'creation' },
  { tri: 'modification' },
]
