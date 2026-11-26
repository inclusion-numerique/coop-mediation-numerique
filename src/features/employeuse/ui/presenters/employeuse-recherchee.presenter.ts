import { toTitleCase } from '@/libraries/texte'
import type { Employeuse } from '../../domain/employeuse'
import { employeuseAffichage } from './employeuse.presenter'

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
