import { inject } from '@app/web/libs/injection'
import { classifyLieux } from './classifyLieu'
import { isNewLieu } from './isNewLieu'
import {
  type ExistingLieuxActivite,
  FIND_EXISTING_LIEUX_ACTIVITES_KEY,
} from './lieuActivite'
import type { LieuActiviteInput } from './lieuActiviteInput'
import { ClassifiedLieu, processClassifiedLieu } from './processClassifiedLieu'
import { FIND_STRUCTURES_BY_CARTO_IDS_KEY } from './structure'

type Input = {
  userId: string
  mediateurId: string
  lieuxActivite: LieuActiviteInput[]
}

const toStructureId = (activite: ExistingLieuxActivite) => activite.structureId

const toCartoId = (lieu: LieuActiviteInput) =>
  lieu.structureCartographieNationaleId

const isDefined = (id?: string | null): id is string => id != null

const createActiviteFor = (mediateurId: string) => (lieu: ClassifiedLieu) =>
  processClassifiedLieu(lieu, mediateurId)

export const ajouterLieuxActivite = async ({
  userId,
  mediateurId,
  lieuxActivite,
}: Input) => {
  const lieuxToProcess = lieuxActivite.filter(
    isNewLieu(
      new Set(
        (await inject(FIND_EXISTING_LIEUX_ACTIVITES_KEY)(userId)).map(
          toStructureId,
        ),
      ),
    ),
  )

  if (lieuxToProcess.length === 0) return { newActivites: [] }

  const structuresByCartoId = await inject(FIND_STRUCTURES_BY_CARTO_IDS_KEY)(
    lieuxToProcess.map(toCartoId).filter(isDefined),
  )

  const newActivites = await Promise.all(
    classifyLieux(lieuxToProcess, structuresByCartoId).map(
      createActiviteFor(mediateurId),
    ),
  )

  return { newActivites }
}
