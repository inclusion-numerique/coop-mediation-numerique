import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { Employeuse } from '../../../domain/employeuse'
import { employeuseAffichage } from '../../../ui/employeuse.presenter'

/**
 * Résultat de recherche affichable. Les dénominations et adresses de SIRENE
 * arrivent en capitales : on les remet en casse de titre pour l'affichage, sans
 * toucher à la donnée.
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
    nom: toTitleCase(affichage.nom ?? '', { noUpper: true }),
    adresse: toTitleCase(affichage.adresse ?? '', { noUpper: true }),
    commune: toTitleCase(affichage.commune ?? ''),
    codePostal: affichage.codePostal ?? '',
    codeInsee: affichage.codeInsee,
    siret: affichage.siret,
    rna: affichage.rna,
  }
}
