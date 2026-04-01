import { inject } from '@app/web/libs/injection'
import { CREATE_MEDIATEUR_EN_ACTIVITE_KEY } from '../lieuActivite'

export type LinkLieu = { case: 'link-existing'; structureId: string }

export const linkExisting = ({ structureId }: LinkLieu, mediateurId: string) =>
  inject(CREATE_MEDIATEUR_EN_ACTIVITE_KEY)(mediateurId, structureId)
