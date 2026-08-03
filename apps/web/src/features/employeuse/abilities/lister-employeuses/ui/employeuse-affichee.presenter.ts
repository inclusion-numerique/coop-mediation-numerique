import { toTitleCase } from '@app/web/utils/toTitleCase'
import { employeuseAffichage } from '../../../ui/employeuse.presenter'
import type { EmployeuseListee } from '../domain/lister-employeuses'

const INCONNUE = new Date(0)

/**
 * Ligne de la liste d'administration.
 *
 * Les colonnes non nullables reflètent le gabarit du tableau, pas le domaine :
 * un tableau affiche une cellule vide, pas une absence. Les horodatages
 * manquants — `main` les rend optionnels — retombent sur l'époque, seule valeur
 * qui trie sans mentir sur l'ordre.
 */
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
    nom: toTitleCase(affichage.nom ?? '', { noUpper: true }),
    siret: affichage.siret,
    adresse: toTitleCase(affichage.adresse ?? '', { noUpper: true }),
    commune: toTitleCase(affichage.commune ?? ''),
    codePostal: affichage.codePostal ?? '',
    creation: employeuse.creation ?? INCONNUE,
    modification: employeuse.modification ?? employeuse.creation ?? INCONNUE,
    _count: { emplois: personnesEmployees },
  }
}
