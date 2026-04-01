import type { CreatedActivite } from '../lieuActivite'
import { type CreateLieuFromCarto, createFromCarto } from './createFromCarto'
import { type CreateLieuFromData, createFromData } from './createFromData'
import { type LinkLieu, linkExisting } from './linkExisting'

export type ClassifiedLieu = LinkLieu | CreateLieuFromData | CreateLieuFromCarto

type Handler<T> = (lieu: T, mediateurId: string) => Promise<CreatedActivite>

const handlers = {
  'link-existing': linkExisting,
  'create-from-data': createFromData,
  'create-from-carto': createFromCarto,
}

export const processClassifiedLieu = <T extends ClassifiedLieu>(
  lieu: T,
  mediateurId: string,
): Promise<CreatedActivite> => {
  const handler = handlers[lieu.case] as Handler<T>
  return handler(lieu, mediateurId)
}
