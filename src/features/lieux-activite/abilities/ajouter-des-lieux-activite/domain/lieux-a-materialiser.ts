import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import { identifiantsCarto } from './identifiants-carto'
import type { LieuDejaRattache, LieuDemande } from './lieu-demande'

const identite = ({
  id,
  structureCartographieNationaleId,
  nom,
}: LieuDemande): string =>
  onlyDefinedAndNotNull(id)
    ? `id:${id}`
    : onlyDefinedAndNotNull(structureCartographieNationaleId)
      ? `carto:${structureCartographieNationaleId}`
      : `nom:${nom}`

const estDejaRattache = (dejaRattaches: readonly LieuDejaRattache[]) => {
  const ids = new Set(dejaRattaches.map(({ id }) => id))
  const cartoIds = new Set(identifiantsCarto(dejaRattaches))

  return ({ id, structureCartographieNationaleId }: LieuDemande): boolean =>
    (onlyDefinedAndNotNull(id) && ids.has(id)) ||
    (onlyDefinedAndNotNull(structureCartographieNationaleId) &&
      cartoIds.has(structureCartographieNationaleId))
}

const premiereApparition = (
  demande: LieuDemande,
  rang: number,
  demandes: readonly LieuDemande[],
): boolean =>
  demandes.findIndex((autre) => identite(autre) === identite(demande)) === rang

export const lieuxAMaterialiser = (
  dejaRattaches: readonly LieuDejaRattache[],
  demandes: readonly LieuDemande[],
): readonly LieuDemande[] => {
  const dejaRattache = estDejaRattache(dejaRattaches)

  return demandes
    .filter((demande) => !dejaRattache(demande))
    .filter(premiereApparition)
}
