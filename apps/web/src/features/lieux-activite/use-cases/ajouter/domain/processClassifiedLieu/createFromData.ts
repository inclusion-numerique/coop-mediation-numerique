import { inject } from '@app/web/libs/injection'
import { CREATE_MEDIATEUR_EN_ACTIVITE_KEY } from '../lieuActivite'
import {
  CREATE_STRUCTURE_FROM_DATA_KEY,
  type StructureToCreate,
} from '../structure'

export type CreateLieuFromData = {
  case: 'create-from-data'
  data: StructureToCreate
}

export const createFromData = async (
  { data }: CreateLieuFromData,
  mediateurId: string,
) => {
  const structure = await inject(CREATE_STRUCTURE_FROM_DATA_KEY)(data)
  return inject(CREATE_MEDIATEUR_EN_ACTIVITE_KEY)(mediateurId, structure.id)
}
