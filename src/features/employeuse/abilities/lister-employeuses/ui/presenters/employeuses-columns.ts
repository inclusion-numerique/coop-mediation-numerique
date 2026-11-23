type EmployeuseTri = 'nom' | 'emplois' | 'creation' | 'modification'

export type EmployeuseColumn = {
  readonly label: string
  readonly tri?: EmployeuseTri
  readonly isDefault?: boolean
}

export const employeusesColumns: readonly EmployeuseColumn[] = [
  { label: 'Nom', tri: 'nom', isDefault: true },
  { label: 'SIRET' },
  { label: 'Adresse' },
  { label: 'Commune' },
  { label: 'Emplois', tri: 'emplois' },
  { label: 'Création', tri: 'creation' },
  { label: 'Modification', tri: 'modification' },
]
