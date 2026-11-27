import { employeuseAffichage } from '../../../../ui/presenters/employeuse.presenter'
import type {
  EmployeuseConsultee,
  PersonneEmployee,
} from '../../domain/employeuse-consultee'

export type EmployeuseConsulteeAffichage = {
  nom: string
  denominationSirene: string | null
  siret: string | null
  rna: string | null
  adresse: string | null
  codeInsee: string | null
  aUnReferent: boolean
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
  personnesEmployees: { id: string; libelle: string; courriel: string }[]
}

const libelle = ({
  prenom,
  nom,
  nomComplet,
  courriel,
}: PersonneEmployee): string =>
  [prenom, nom].filter(Boolean).join(' ') || nomComplet || courriel || ''

export const employeuseConsulteeAffichage = ({
  employeuse,
  personnesEmployees,
}: EmployeuseConsultee): EmployeuseConsulteeAffichage => {
  const affichage = employeuseAffichage(employeuse)

  return {
    nom: affichage.nom ?? '',
    denominationSirene: employeuse.denominationSirene,
    siret: affichage.siret,
    rna: affichage.rna,
    adresse:
      [
        affichage.adresse,
        [affichage.codePostal, affichage.commune].filter(Boolean).join(' '),
      ]
        .filter(Boolean)
        .join(', ') || null,
    codeInsee: affichage.codeInsee,
    aUnReferent: affichage.aUnReferent,
    nomReferent: affichage.nomReferent,
    courrielReferent: affichage.courrielReferent,
    telephoneReferent: affichage.telephoneReferent,
    personnesEmployees: personnesEmployees.map((personne) => ({
      id: personne.utilisateurId,
      libelle: libelle(personne),
      courriel: personne.courriel ?? '',
    })),
  }
}
