import { ObjectId } from 'mongodb'
import type { DBRef } from '../migrate-cras-v1/CraV1Document'

export type PermanenceV1Document = {
  _id: ObjectId
  adresse: {
    numeroRue: string
    rue: string
    codePostal: string
    ville: string
    codeCommune: string
  }
  conseillers: ObjectId[]
  conseillersItinerants: ObjectId[]
  email: string | null
  estStructure: boolean
  horaires: {
    matin: [string, string]
    apresMidi: [string, string]
  }[]
  lieuPrincipalPour: ObjectId[]
  location: {
    type: 'Point'
    coordinates: [number, number] | [string, string]
  }
  nomEnseigne: string
  numeroTelephone: string
  siret: string | null
  siteWeb: string | null
  structure: DBRef
  typeAcces: string[]
  updatedAt: string
  updatedBy: ObjectId
}
