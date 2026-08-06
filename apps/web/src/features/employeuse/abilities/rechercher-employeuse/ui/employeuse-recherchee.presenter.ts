import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { Employeuse } from '../../../domain/employeuse'
import { employeuseAffichage } from '../../../ui/employeuse.presenter'

/**
 * Résultat de recherche affichable. Les adresses de SIRENE arrivent en
 * capitales : on les remet en casse de titre pour l'affichage, sans toucher à
 * la donnée. La dénomination, elle, reste telle quelle — c'est une raison
 * sociale, et la recasser produit des noms faux (« Pimms De Bordeaux »).
 */
export type EmployeuseRecherchee = {
  id: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
  siret: string | null
  rna: string | null
}

export const employeuseRecherchee = (
  employeuse: Employeuse,
): EmployeuseRecherchee => {
  const affichage = employeuseAffichage(employeuse)

  return {
    id: String(affichage.id),
    nom: affichage.nom ?? '',
    adresse: toTitleCase(affichage.adresse ?? '', { noUpper: true }),
    commune: toTitleCase(affichage.commune ?? ''),
    codePostal: affichage.codePostal ?? '',
    codeInsee: affichage.codeInsee,
    siret: affichage.siret,
    rna: affichage.rna,
  }
}
