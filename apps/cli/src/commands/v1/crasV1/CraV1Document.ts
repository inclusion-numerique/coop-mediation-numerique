import { Collection, ObjectId } from 'mongodb'

export type V1Theme =
  | 'equipement informatique'
  | 'internet'
  | 'demarche en ligne'
  | 'contenus numeriques'
  | 'traitement texte'
  | 'echanger'
  | 'courriel'
  | 'vocabulaire'
  | 'sante'
  | 'scolaire'
  | 'accompagner enfant'
  | 'trouver emploi'
  | 'budget'
  | 'diagnostic'
  | 'tpe/pme'
  | 'fraude et harcelement'
  | 'securite'
  | 'autre'
  | 'smartphone'

export type V1Canal = 'domicile' | 'rattachement' | 'autre lieu' | 'distance'

export type V1Activite = 'ponctuel' | 'individuel' | 'collectif'

// MongoDB DBRef type for references to other collections
export type DBRef = {
  $ref: string
  $id: string
  $db: string
}

// Age distribution of participants
export type AgeDistribution = {
  moins12ans: number
  de12a18ans: number
  de18a35ans: number
  de35a60ans: number
  plus60ans: number
}

// Employment status distribution of participants
export type StatutDistribution = {
  etudiant: number
  sansEmploi: number
  enEmploi: number
  retraite: number
  heterogene: number
}

// Type of support provided
export type Accompagnement = {
  individuel: number
  atelier: number
  redirection: number
}

// Sub-theme structure for detailed categorization
export type SousTheme = {
  annotation?: string[]
  equipement_informatique?: string[]
  [key: string]: string[] | undefined
}

// Main CRA (Compte Rendu d'Activité) data structure
export type CraData = {
  // Date of the support session
  dateAccompagnement: string
  // Number of recurring participants (can be null)
  nbParticipantsRecurrents?: number | null
  // Age distribution of participants
  age: AgeDistribution
  // Employment status distribution
  statut: StatutDistribution
  // Type of support provided
  accompagnement: Accompagnement
  // Channel through which the support was provided
  canal: V1Canal
  // Type of activity
  activite: V1Activite
  // Total number of participants
  nbParticipants: number
  // Main themes covered during the session
  themes: V1Theme[]
  // Sub-themes for detailed categorization (optional)
  sousThemes?: SousTheme[]
  // Duration of the session (can be string or number)
  duree: string | number
  // Postal code of the location
  codePostal: string
  // Name of the commune
  nomCommune: string
  // INSEE code of the commune
  codeCommune: string
  // Associated organizations (can be null)
  organismes: string[] | null
}

// Main CRA V1 document structure
export type CraV1Document = {
  // MongoDB document ID
  _id: ObjectId
  // Main CRA data
  cra: CraData
  // Reference to the digital advisor
  conseiller: DBRef
  // Reference to the structure/organization
  structure: DBRef
  // Reference to permanence (optional)
  permanence?: DBRef
  // Document creation timestamp
  createdAt: string
}
