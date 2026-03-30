import { key } from '@app/web/libs/injection'

export type CartoStructure = {
  id: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  pivot: string
  codeInsee: string | null
  complementAdresse: string | null
  longitude: number | null
  latitude: number | null
  ficheAccesLibre: string | null
  presentationDetail: string | null
  presentationResume: string | null
  horaires: string | null
  source: string | null
  siteWeb: string | null
  typologie: string | null
  modalitesAccompagnement: string | null
  services: string | null
  modalitesAcces: string | null
  fraisACharge: string | null
  itinerance: string | null
  priseEnChargeSpecifique: string | null
  publicsSpecifiquementAdresses: string | null
  courriels: string | null
  telephone: string | null
}

export type FindCartoStructure = (
  cartoId: string,
) => Promise<CartoStructure | null>

export const FIND_CARTO_STRUCTURE_KEY =
  key<FindCartoStructure>('findCartoStructure')

export type CreateStructureFromCarto = (
  cartoStructure: CartoStructure,
) => Promise<{ id: string }>

export const CREATE_STRUCTURE_FROM_CARTO_KEY = key<CreateStructureFromCarto>(
  'createStructureFromCarto',
)
