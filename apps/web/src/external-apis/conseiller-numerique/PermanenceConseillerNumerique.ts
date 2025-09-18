import type { ObjectId } from 'mongodb'

export type PermanenceConseillerNumerique = {
  _id: ObjectId
  nomEnseigne: string
  siteWeb: string | null
  siret: string
  estStructure: boolean
  numeroTelephone: string | null
  email: string | null
  location: {
    type: 'Point'
    coordinates: number[]
  }
  adresse: {
    numeroRue: string
    rue: string
    codePostal: string
    codeCommune: string
    ville: string
  }
  nonAffichageCarto: boolean
  structure: { _id: ObjectId }
}
