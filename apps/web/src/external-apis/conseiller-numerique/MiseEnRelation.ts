import type { ObjectId } from 'mongodb'

export type MiseEnRelation = {
  _id: ObjectId
  idPG: number
  type: string // 'DEPARTEMENT' | 'REGION' | 'COMMUNE' - assuming other values
  statut: string // 'VALIDATION_COSELEC' | other possible statuses
  nom: string
  siret: string
  aIdentifieCandidat: boolean
  dateDebutMission: Date
  nombreConseillersSouhaites: number
  estLabelliseFranceServices: 'OUI' | 'NON' // assuming possible values
  codePostal: string
  location: {
    type: 'Point'
    coordinates: number[]
  }
  nomCommune: string
  codeCommune: string
  codeDepartement: string
  codeRegion: string
  emailConfirmedAt: Date
  emailConfirmationKey: string
  unsubscribedAt: Date | null
  unsubscribeExtras: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  validatedAt: Date | null
  importedAt: Date
  deleted_at: Date | null
  userCreated: boolean
  coselecAt: Date
  insee: {
    siret: string
    siege_social: boolean
    etat_administratif: string // 'A' | other possible states
    date_fermeture: Date | null
    enseigne: string | null
    activite_principale: Record<string, unknown>
    tranche_effectif_salarie: Record<string, unknown>
    diffusable_commercialement: boolean
    status_diffusion: string // 'diffusible' | other possible statuses
    date_creation: number // timestamp
    unite_legale: Record<string, unknown>
    adresse: Record<string, unknown>
  }
  coordonneesInsee: {
    type: 'Point'
    coordinates: number[]
  }
  coselec: Array<Record<string, unknown>>
  estZRR: boolean
  prefet: Array<Record<string, unknown>>
  contact: {
    prenom: string
    nom: string
    fonction: string
    email: string
    telephone: string
  }
  qpvListe: Array<unknown>
  qpvStatut: string // 'Sans objet' | other possible statuses
  codeCom: string | null
  conventionnement: {
    dossierConventionnement: Record<string, unknown>
    statut: string // 'CONVENTIONNEMENT_VALIDÉ' | other possible statuses
  }
  adresseInsee2Ban: {
    label: string
    score: number
    housenumber: string
    id: string
    name: string
    postcode: string
    citycode: string
    x: number
    y: number
    city: string
    context: string
    type: string // 'housenumber' | other possible types
    importance: number
    street: string
  }
  coordinateurCandidature: boolean
  coordinateurTypeContrat: string | null
}
