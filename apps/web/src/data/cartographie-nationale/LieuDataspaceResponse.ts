export type LieuDataspaceResponse = {
  id: string
  nom: string
  pivot: string
  adresse: {
    commune: string
    nom_voie: string
    code_insee: string
    repetition: string
    code_postal: string
    numero_voie: string
  }
  complement_adresse?: string
  latitude?: number
  longitude?: number
  telephone?: string
  courriels?: string
  site_web?: string
  horaires?: string
  date_maj: string
  source: string
  presentation_resume?: string
  presentation_detail?: string
  services: string[]
  publics_specifiquement_adresses?: string[]
  prise_en_charge_specifique?: string[]
  frais_a_charge?: string[]
  dispositif_programmes_nationaux?: string[]
  formations_labels?: string[]
  itinerance?: string[]
  typologie?: string[]
  autres_formations_labels?: string[]
  modalites_acces?: string[]
  modalites_accompagnement?: string[]
  fiche_acces_libre?: string
  prise_rdv?: string
  structure_parente?: string
}
