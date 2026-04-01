import type { LieuActiviteInput } from './lieuActiviteInput'
import { ClassifiedLieu } from './processClassifiedLieu'
import type { StructureToCreate } from './structure'

const toStructureToCreate = (lieu: LieuActiviteInput): StructureToCreate => ({
  nom: lieu.nom,
  siret: lieu.siret ?? undefined,
  adresse: lieu.adresse ?? '',
  commune: lieu.commune ?? '',
  codePostal: lieu.codePostal ?? '',
  codeInsee: lieu.codeInsee ?? undefined,
  complementAdresse: lieu.complementAdresse ?? undefined,
})

export const classifyLieu = (
  lieu: LieuActiviteInput,
  existingStructuresByCartoId: Map<string, string>,
): ClassifiedLieu => {
  if (lieu.id) {
    return { case: 'link-existing', structureId: lieu.id }
  }

  if (!lieu.structureCartographieNationaleId) {
    return { case: 'create-from-data', data: toStructureToCreate(lieu) }
  }

  const existingStructureId = existingStructuresByCartoId.get(
    lieu.structureCartographieNationaleId,
  )

  if (existingStructureId) {
    return { case: 'link-existing', structureId: existingStructureId }
  }

  return {
    case: 'create-from-carto',
    cartoId: lieu.structureCartographieNationaleId,
  }
}

export const classifyLieux = (
  lieux: LieuActiviteInput[],
  existingStructuresByCartoId: Map<string, string>,
): ClassifiedLieu[] =>
  lieux.map((lieu) => classifyLieu(lieu, existingStructuresByCartoId))
