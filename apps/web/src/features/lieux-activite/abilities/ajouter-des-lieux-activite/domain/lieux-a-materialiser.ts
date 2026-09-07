import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import { identifiantsCarto } from './identifiants-carto'
import type { LieuDejaRattache, LieuDemande } from './lieu-demande'

/**
 * Ce par quoi deux demandes se confondent.
 *
 * Faute d'identité — ni id interne, ni id de cartographie —, c'est la
 * dénomination qui départage : un même nom soumis deux fois désigne le même
 * lieu, la persistance le corrélant de toute façon sur son adresse. Le préfixe
 * empêche qu'une dénomination coïncide avec un identifiant.
 */
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

/**
 * Le lieu auquel le médiateur exerce déjà : l'ajouter une seconde fois n'ajoute
 * rien.
 *
 * Un lieu se reconnaît par DEUX identités indépendantes, et il suffit que l'une
 * corresponde pour qu'il s'agisse du même lieu : son id interne (la seule
 * certaine) et son id de cartographie nationale, annotation tardive posée par le
 * job de synchronisation sur un lieu déjà créé. Selon d'où vient le lieu demandé
 * — les lieux déjà rattachés portent les deux, la recherche coop rend l'id
 * interne seul, la carto le sien seul — c'est l'une ou l'autre qui parle.
 */
const estDejaRattache = (dejaRattaches: readonly LieuDejaRattache[]) => {
  const ids = new Set(dejaRattaches.map(({ id }) => id))
  const cartoIds = new Set(identifiantsCarto(dejaRattaches))

  return ({ id, structureCartographieNationaleId }: LieuDemande): boolean =>
    (onlyDefinedAndNotNull(id) && ids.has(id)) ||
    (onlyDefinedAndNotNull(structureCartographieNationaleId) &&
      cartoIds.has(structureCartographieNationaleId))
}

/**
 * Le même lieu demandé deux fois dans un même panier n'est retenu qu'une fois —
 * la première, l'ordre du panier étant celui de la sélection.
 *
 * Ce départage se fait entre les demandes, là où le filtre précédent confronte
 * chaque demande à l'EXISTANT : un lieu qu'on n'a pas encore ne s'oppose pas à
 * lui-même.
 */
const premiereApparition = (
  demande: LieuDemande,
  rang: number,
  demandes: readonly LieuDemande[],
): boolean =>
  demandes.findIndex((autre) => identite(autre) === identite(demande)) === rang

/** Parmi les lieux demandés, ceux qu'il reste à matérialiser. */
export const lieuxAMaterialiser = (
  dejaRattaches: readonly LieuDejaRattache[],
  demandes: readonly LieuDemande[],
): readonly LieuDemande[] => {
  const dejaRattache = estDejaRattache(dejaRattaches)

  return demandes
    .filter((demande) => !dejaRattache(demande))
    .filter(premiereApparition)
}
