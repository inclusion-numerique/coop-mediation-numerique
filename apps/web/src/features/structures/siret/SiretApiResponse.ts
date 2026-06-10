// Etablissement data for a SIRET, built from the public Recherche
// d'entreprises API (https://recherche-entreprises.api.gouv.fr).
// Only the fields consumed by the app are exposed.
export type SiretApiResponse = {
  data: EtablissementData
}

// Represents detailed data about an establishment
type EtablissementData = {
  siret: string // SIRET number of the establishment
  siege_social: boolean // Indicates if the establishment is the head office
  etat_administratif: 'A' | 'F' // Administrative status of the establishment ('A' for active, 'F' for closed)
  activite_principale: ActivitePrincipale // Main activity attributes of the establishment
  unite_legale: UniteLegale // Legal unit associated with the establishment
  adresse: Adresse // Address of the establishment
}

// Represents main activity attributes of an establishment
type ActivitePrincipale = {
  code?: string // Main activity code (APE), nullable
  nomenclature?: string // Nomenclature associated with the APE code, nullable
}

// Represents the legal unit associated with the establishment
type UniteLegale = {
  siren: string // SIREN number of the legal unit
  type: 'personne_physique' | 'personne_morale' // Type of legal person (individual or corporate)
  personne_morale_attributs?: PersonneMoraleAttributs // Attributes for corporate legal person, nullable
  forme_juridique: FormeJuridique // Legal form attributes of the legal unit
}

// Represents attributes for corporate legal person
type PersonneMoraleAttributs = {
  raison_sociale?: string // Corporate name of the legal unit, nullable
}

// Represents legal form attributes of a legal unit
// The public API only provides the code (catégorie juridique INSEE)
type FormeJuridique = {
  code: string // Code of the legal form
}

// Represents the address of the establishment
// The public API provides the full address as a single string, so the voie
// is exposed through libelle_voie and the detailed parts stay null
type Adresse = {
  numero_voie: string | null // Number in the street (can be null)
  indice_repetition_voie?: string | null // Repetition index in the street, nullable
  type_voie?: string | null // Type of street, nullable
  libelle_voie: string // Street name
  complement_adresse?: string | null // Additional address information, nullable
  code_commune?: string // Code of the commune, nullable
  code_postal: string // Postal code
  libelle_commune?: string // Name of the commune for addresses in France, nullable
}
