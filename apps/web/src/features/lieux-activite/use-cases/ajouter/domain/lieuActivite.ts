import { key } from '@app/web/libs/injection'

export type ExistingLieuxActivite = {
  structureId: string
  cartoId: string | null
}

export type CreatedActivite = {
  id: string
  structureId: string
}

export type FindExistingLieuxActivite = (
  userId: string,
) => Promise<ExistingLieuxActivite[]>

export const FIND_EXISTING_LIEUX_ACTIVITES_KEY = key<FindExistingLieuxActivite>(
  'findExistingLieuxActivite',
)

export type CreateMediateurEnActivite = (
  mediateurId: string,
  structureId: string,
) => Promise<CreatedActivite>

export const CREATE_MEDIATEUR_EN_ACTIVITE_KEY = key<CreateMediateurEnActivite>(
  'createMediateurEnActivite',
)
