import { toTitleCase } from '@app/web/utils/toTitleCase'
import { employeuseAffichage } from '../../../ui/employeuse.presenter'
import type {
  EmployeuseConsultee,
  PersonneEmployee,
} from '../domain/consulter-employeuse'

export type EmployeuseConsulteeAffichage = {
  nom: string
  denominationSirene: string | null
  siret: string | null
  rna: string | null
  adresse: string | null
  codeInsee: string | null
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
  personnesEmployees: { id: string; libelle: string; courriel: string }[]
}

/** Une personne se nomme par son identité, à défaut par son nom d'usage, à défaut par son courriel. */
const libelle = ({
  prenom,
  nom,
  nomComplet,
  courriel,
}: PersonneEmployee): string =>
  [prenom, nom].filter(Boolean).join(' ') || nomComplet || courriel

export const employeuseConsulteeAffichage = ({
  employeuse,
  personnesEmployees,
}: EmployeuseConsultee): EmployeuseConsulteeAffichage => {
  const affichage = employeuseAffichage(employeuse)

  return {
    // La dénomination n'est pas remise en casse de titre : c'est une raison
    // sociale, elle s'affiche telle que la source la porte.
    nom: affichage.nom ?? '',
    denominationSirene: employeuse.denominationSirene,
    siret: affichage.siret,
    rna: affichage.rna,
    // Adresse d'une pièce, telle que la fiche l'affiche : voie, puis code postal
    // et commune. `main` ne porte pas de complément d'adresse (décision 6).
    adresse:
      [
        affichage.adresse,
        [affichage.codePostal, affichage.commune].filter(Boolean).join(' '),
      ]
        .filter(Boolean)
        .join(', ') || null,
    codeInsee: affichage.codeInsee,
    nomReferent: affichage.nomReferent,
    courrielReferent: affichage.courrielReferent,
    telephoneReferent: affichage.telephoneReferent,
    personnesEmployees: personnesEmployees.map((personne) => ({
      id: personne.utilisateurId,
      libelle: libelle(personne),
      courriel: personne.courriel,
    })),
  }
}
