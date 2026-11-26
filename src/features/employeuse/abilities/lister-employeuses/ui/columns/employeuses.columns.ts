import type { ColonneDesEmployeuses } from '../../domain/employeuse-listee'

export type EmployeuseColumn = {
  readonly label: string
  readonly tri?: ColonneDesEmployeuses
}

export const employeusesColumns: readonly EmployeuseColumn[] = [
  { label: 'Nom', tri: 'nom' },
  { label: 'SIRET' },
  { label: 'Adresse' },
  { label: 'Commune' },
  { label: 'Emplois', tri: 'emplois' },
  { label: 'Création', tri: 'creation' },
  { label: 'Modification', tri: 'modification' },
]
