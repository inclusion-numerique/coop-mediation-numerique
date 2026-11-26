export type SiretApiResponse = {
  data: EtablissementData
}

type EtablissementData = {
  siret: string
  siege_social: boolean
  etat_administratif: 'A' | 'F'
  activite_principale: ActivitePrincipale
  unite_legale: UniteLegale
  adresse: Adresse
}

type ActivitePrincipale = {
  code?: string
  nomenclature?: string
}

type UniteLegale = {
  siren: string
  type: 'personne_physique' | 'personne_morale'
  nom_complet: string
  personne_morale_attributs?: PersonneMoraleAttributs
  forme_juridique: FormeJuridique
}

type PersonneMoraleAttributs = {
  raison_sociale?: string
}

type FormeJuridique = {
  code: string
}

type Adresse = {
  numero_voie: string | null
  indice_repetition_voie?: string | null
  type_voie?: string | null
  libelle_voie: string
  complement_adresse?: string | null
  code_commune?: string
  code_postal: string
  libelle_commune?: string
}
