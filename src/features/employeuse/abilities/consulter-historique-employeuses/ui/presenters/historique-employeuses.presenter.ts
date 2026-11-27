import {
  debutEmploi,
  estTerminee,
  finEmploi,
} from '../../../../domain/affectation/periode-emploi'
import type { EmployeuseHistorique } from '../../../../domain/consultation/employeuses-historique'
import { employeuseAffichage } from '../../../../ui/presenters/employeuse.presenter'

export type EmployeuseHistoriqueAffichage = {
  id: string
  estActive: boolean
  debut: Date | null
  fin: Date | null
  termine: boolean
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
      termine: estTerminee(periode),
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
