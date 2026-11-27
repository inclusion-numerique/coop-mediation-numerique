import type { LieuDemande } from '../../../domain/rattachement/lieu-demande'
import { identifiantsCarto } from './identifiants-carto'
import type { LieuDejaRattache } from './lieu-deja-rattache'

const identifiantInterne = (lieu: LieuDemande) =>
  lieu._tag === 'LieuExistant' ? lieu.id : null

const identite = (lieu: LieuDemande): string => {
  const id = identifiantInterne(lieu)

  if (id !== null) return `id:${id}`

  return lieu.structureCartographieNationaleId === null
    ? `nom:${lieu.nom}`
    : `carto:${lieu.structureCartographieNationaleId}`
}

const estDejaRattache = (dejaRattaches: readonly LieuDejaRattache[]) => {
  const ids = new Set(dejaRattaches.map(({ id }) => id))
  const cartoIds = new Set(identifiantsCarto(dejaRattaches))

  return (lieu: LieuDemande): boolean => {
    const id = identifiantInterne(lieu)

    return (
      (id !== null && ids.has(id)) ||
      (lieu.structureCartographieNationaleId !== null &&
        cartoIds.has(lieu.structureCartographieNationaleId))
    )
  }
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
