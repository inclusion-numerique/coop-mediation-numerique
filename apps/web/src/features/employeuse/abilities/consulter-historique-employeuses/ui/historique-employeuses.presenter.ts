import type { EmployeuseHistorique } from '../../../domain/employeuses-historique'
import { debutEmploi, finEmploi } from '../../../domain/periode-emploi'
import { employeuseAffichage } from '../../../ui/employeuse.presenter'

/**
 * Historique mis à plat pour la page d'administration d'un utilisateur.
 *
 * Les champs de `structure` sont non-nuls parce que l'affichage admin les
 * partage avec les lieux, dont le nom et l'adresse sont obligatoires. Le repli
 * sur la chaîne vide est donc une contrainte de ce gabarit d'affichage, décidée
 * ici et pas dans la lecture — le domaine, lui, continue de dire qu'une
 * employeuse peut n'avoir ni nom ni adresse.
 */
export type EmployeuseHistoriqueAffichage = {
  id: string
  estActive: boolean
  debut: Date | null
  fin: Date | null
  creation: Date | null
  structure: {
    id: string
    nom: string
    adresse: string
    commune: string
    codePostal: string
    codeInsee: string | null
    siret: string | null
    rna: string | null
    creation: Date | null
    suppression: Date | null
  }
}

export const historiqueEmployeusesAffichage = (
  historique: readonly EmployeuseHistorique[],
): EmployeuseHistoriqueAffichage[] =>
  historique.map(({ employeuse, affectationActive, periode, depuis }) => {
    const affichage = employeuseAffichage(employeuse)
    const id = String(employeuse.id)

    return {
      id,
      estActive: affectationActive,
      debut: debutEmploi(periode),
      fin: finEmploi(periode),
      creation: depuis,
      structure: {
        id,
        nom: affichage.nom ?? '',
        adresse: affichage.adresse ?? '',
        commune: affichage.commune ?? '',
        codePostal: affichage.codePostal ?? '',
        codeInsee: affichage.codeInsee,
        siret: affichage.siret,
        rna: affichage.rna,
        creation: employeuse.creation,
        suppression: employeuse.suppression,
      },
    }
  })
