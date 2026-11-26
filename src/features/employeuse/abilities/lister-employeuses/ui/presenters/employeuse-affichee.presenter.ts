import { toTitleCase } from '@/libraries/texte'
import { employeuseAffichage } from '../../../../ui/presenters/employeuse.presenter'
import type { EmployeuseListee } from '../../domain/employeuse-listee'

const INCONNUE = new Date(0)

export type EmployeuseAffichee = {
  id: string
  nom: string
  siret: string | null
  adresse: string
  commune: string
  codePostal: string
  creation: Date
  modification: Date
  _count: { emplois: number }
}

export const employeuseAffichee = ({
  employeuse,
  personnesEmployees,
}: EmployeuseListee): EmployeuseAffichee => {
  const affichage = employeuseAffichage(employeuse)

  return {
    id: String(affichage.id),
    nom: affichage.nom ?? '',
    siret: affichage.siret,
    adresse: toTitleCase(affichage.adresse ?? '', { noUpper: true }),
    commune: toTitleCase(affichage.commune ?? ''),
    codePostal: affichage.codePostal ?? '',
    creation: employeuse.creation ?? INCONNUE,
    modification: employeuse.modification ?? employeuse.creation ?? INCONNUE,
    _count: { emplois: personnesEmployees },
  }
}
