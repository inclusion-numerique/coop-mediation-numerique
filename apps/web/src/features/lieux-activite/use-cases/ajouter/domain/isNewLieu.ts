import type { LieuActiviteInput } from './lieuActiviteInput'

const hasInternalId = (lieu: LieuActiviteInput): boolean => lieu.id != null

const isLinkedToUser = (
  lieu: LieuActiviteInput,
  existingStructureIds: Set<string>,
): boolean => lieu.id != null && existingStructureIds.has(lieu.id)

const isFromCartographie = (lieu: LieuActiviteInput): boolean =>
  lieu.structureCartographieNationaleId != null

const isFromFormData = (lieu: LieuActiviteInput): boolean => lieu.nom != null

export const isNewLieu =
  (existingStructureIds: Set<string>) =>
  (lieu: LieuActiviteInput): boolean =>
    hasInternalId(lieu)
      ? !isLinkedToUser(lieu, existingStructureIds)
      : isFromCartographie(lieu) || isFromFormData(lieu)
