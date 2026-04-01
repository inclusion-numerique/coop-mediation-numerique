import { key } from '@app/web/libs/injection'

export type StructureToCreate = {
  nom: string
  siret?: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee?: string
  complementAdresse?: string
}

export type CreateStructureFromData = (
  data: StructureToCreate,
) => Promise<{ id: string }>

export const CREATE_STRUCTURE_FROM_DATA_KEY = key<CreateStructureFromData>(
  'createStructureFromData',
)

export type FindStructuresByCartoIds = (
  cartoIds: string[],
) => Promise<Map<string, string>>

export const FIND_STRUCTURES_BY_CARTO_IDS_KEY = key<FindStructuresByCartoIds>(
  'findStructuresByCartoIds',
)
