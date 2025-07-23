import { ObjectId } from 'mongodb'

export type StructureV1Document = {
  _id: ObjectId
  aIdentifieCandidat: boolean
  adresseInsee2Ban?: {
    label: string
    score: number
    id: string
    name: string
    postcode: string
    citycode: string
    x: number
    y: number
    city: string
    context: string
    type: string
    importance: number
    street: string
    housenumber?: string
  }
  codeCom: string | null
  codeCommune: string
  codeDepartement: string
  codePostal: string
  codeRegion: string
  contact: {
    prenom: string
    nom: string
    fonction: string
    email: string
    telephone: string
  }
  coordinateurCandidature: boolean
  coordinateurTypeContrat: string | null
  coordonneesInsee?: {
    type: 'Point'
    coordinates: [number, number]
  }
  coselec?: Array<{
    nombreConseillersCoselec: number
    avisCoselec: string
    phaseConventionnement: string
    validateur: string
    insertedAt: string
  }>
  coselecAt?: string
  createdAt: string
  dateDebutMission?: string
  deleted_at: string | null
  emailConfirmationKey?: string
  emailConfirmedAt?: string
  estLabelliseFranceServices?: string
  estZRR?: boolean
  idPG?: number
  importedAt?: string
  insee?: {
    siret: string | null
    siege_social: boolean
    etat_administratif: string
    date_fermeture: string | null
    enseigne: string | null
    activite_principale: {
      code: string
      nomenclature: string
      libelle: string
    }
    tranche_effectif_salarie: {
      de: number | null
      a: number | null
      code: string | null
      date_reference: number | null
      intitule: string | null
    }
    diffusable_commercialement: boolean
    status_diffusion: string
    date_creation: number
    unite_legale: {
      siren: string
      rna: string
      siret_siege_social: string
      type: string
      personne_morale_attributs: {
        raison_sociale: string
        sigle: string | null
      }
      personne_physique_attributs: {
        pseudonyme: string | null
        prenom_usuel: string | null
        prenom_1: string | null
        prenom_2: string | null
        prenom_3: string | null
        prenom_4: string | null
        nom_usage: string | null
        nom_naissance: string | null
        sexe: string | null
      }
      categorie_entreprise: string | null
      status_diffusion: string
      diffusable_commercialement: boolean
      forme_juridique: {
        code: string
        libelle: string
      }
      activite_principale: {
        code: string
        nomenclature: string
        libelle: string
      }
      tranche_effectif_salarie: {
        de: number | null
        a: number | null
        code: string | null
        date_reference: number | null
        intitule: string | null
      }
      economie_sociale_et_solidaire: boolean
      date_creation: number
      etat_administratif: string
    }
    adresse: {
      status_diffusion: string
      complement_adresse: string | null
      numero_voie: string | null
      indice_repetition_voie: string | null
      type_voie: string | null
      libelle_voie: string
      code_postal: string
      libelle_commune: string
      libelle_commune_etranger: string | null
      distribution_speciale: string | null
      code_commune: string
      code_cedex: string | null
      libelle_cedex: string | null
      code_pays_etranger: string | null
      libelle_pays_etranger: string | null
      acheminement_postal: {
        l1: string
        l2: string
        l3: string
        l4: string
        l5: string
        l6: string
        l7: string
      }
    }
  }
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  nom: string
  nomCommune: string
  nombreConseillersSouhaites: number | null
  prefet?: Array<{
    avisPrefet: string
    commentairePrefet: string
    insertedAt: string
    banniereValidationAvisPrefet: boolean
  }>
  qpvListe: Array<any>
  qpvStatut: string
  siret: string | null
  statut: string
  type: string
  unsubscribeExtras: Record<string, unknown>
  unsubscribedAt: string | null
  updatedAt: string
  userCreated: boolean
  validatedAt: string | null
}
