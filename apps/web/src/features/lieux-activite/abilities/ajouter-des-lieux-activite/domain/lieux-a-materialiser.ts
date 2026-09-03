import type { LieuDejaRattache, LieuDemande } from './lieu-demande'

const estDefini = (valeur?: string | null): valeur is string => valeur != null

/**
 * Parmi les lieux demandés, ceux qu'il reste à matérialiser.
 *
 * Un lieu se reconnaît par DEUX identités indépendantes, et il suffit que l'une
 * corresponde pour qu'il s'agisse du même lieu : son id interne (la seule
 * certaine) et son id de cartographie nationale, annotation tardive posée par le
 * job de synchronisation sur un lieu déjà créé. Selon d'où vient le lieu demandé
 * — les lieux déjà rattachés portent les deux, la recherche coop rend l'id
 * interne seul, la carto le sien seul — c'est l'une ou l'autre qui parle.
 *
 * Sont écartés :
 * - le lieu auquel le médiateur exerce déjà, par l'une ou l'autre identité —
 *   ajouter deux fois le même lieu n'ajoute rien ;
 * - le même lieu demandé deux fois dans un même panier, pour la même raison. Le
 *   filtre précédent confronte chaque demande à l'EXISTANT, pas les demandes
 *   entre elles, et un lieu qu'on n'a pas encore ne s'oppose pas à lui-même.
 *
 * Faute d'identité, c'est la dénomination qui départage les doublons du panier :
 * un même nom soumis deux fois désigne le même lieu, la persistance le corrélant
 * de toute façon sur son adresse.
 */
export const lieuxAMaterialiser = (
  dejaRattaches: readonly LieuDejaRattache[],
  demandes: readonly LieuDemande[],
): readonly LieuDemande[] => {
  const idsRattaches = new Set(dejaRattaches.map(({ id }) => id))
  const cartoIdsRattaches = new Set(
    dejaRattaches
      .map(
        ({ structureCartographieNationaleId }) =>
          structureCartographieNationaleId,
      )
      .filter(estDefini),
  )

  const estDejaRattache = ({
    id,
    structureCartographieNationaleId,
  }: LieuDemande) =>
    (estDefini(id) && idsRattaches.has(id)) ||
    (estDefini(structureCartographieNationaleId) &&
      cartoIdsRattaches.has(structureCartographieNationaleId))

  const identite = ({
    id,
    structureCartographieNationaleId,
    nom,
  }: LieuDemande): string =>
    estDefini(id)
      ? `id:${id}`
      : estDefini(structureCartographieNationaleId)
        ? `carto:${structureCartographieNationaleId}`
        : `nom:${nom}`

  const dejaVus = new Set<string>()
  const uneSeuleFois = (demande: LieuDemande): boolean => {
    const cle = identite(demande)

    if (dejaVus.has(cle)) return false

    dejaVus.add(cle)

    return true
  }

  return demandes
    .filter((demande) => !estDejaRattache(demande))
    .filter(uneSeuleFois)
}
