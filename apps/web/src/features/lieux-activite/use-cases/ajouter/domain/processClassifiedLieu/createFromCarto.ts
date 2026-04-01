import { inject } from '@app/web/libs/injection'
import {
  CREATE_STRUCTURE_FROM_CARTO_KEY,
  FIND_CARTO_STRUCTURE_KEY,
} from '../cartoStructure'
import { CREATE_MEDIATEUR_EN_ACTIVITE_KEY } from '../lieuActivite'

export type CreateLieuFromCarto = { case: 'create-from-carto'; cartoId: string }

export const createFromCarto = async (
  { cartoId }: CreateLieuFromCarto,
  mediateurId: string,
) => {
  const cartoStructure = await inject(FIND_CARTO_STRUCTURE_KEY)(cartoId)
  if (!cartoStructure)
    throw new Error(`StructureCartographieNationale not found: ${cartoId}`)

  const structure = await inject(CREATE_STRUCTURE_FROM_CARTO_KEY)(
    cartoStructure,
  )
  return inject(CREATE_MEDIATEUR_EN_ACTIVITE_KEY)(mediateurId, structure.id)
}
