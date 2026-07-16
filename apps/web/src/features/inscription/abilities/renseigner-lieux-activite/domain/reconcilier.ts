/**
 * Activité déjà enregistrée, réduite aux signaux d'identité nécessaires à la
 * réconciliation : l'id de l'activité (à clôturer) et l'identité de son lieu.
 */
export type LieuActiviteExistant = {
  readonly id: string
  readonly lieuInclusion: {
    readonly id: string
    readonly structureCartographieNationaleId: string | null
  }
}

/** Signaux d'identité d'un lieu désiré (le reste de sa donnée voyage avec `T`). */
export type LieuActiviteDesire = {
  readonly id?: string | null
  readonly structureCartographieNationaleId?: string | null
  readonly nom?: string | null
}

export type Reconciliation<T> = {
  /** Ids des activités existantes à clôturer (plus dans la liste désirée). */
  readonly aClaturer: readonly string[]
  /** Lieux désirés à créer (pas encore rattachés). */
  readonly aCreer: readonly T[]
}

const estDefini = (valeur?: string | null): valeur is string => valeur != null

/**
 * Réconcilie l'ensemble des lieux d'activité : rend les activités à clôturer et
 * les lieux à créer pour que l'existant corresponde exactement au désiré.
 * Fonction pure (parité stricte avec la logique legacy) : la couche appelante lit
 * l'existant, résout les structures carto et projette le résultat.
 *
 * - À clôturer : une activité dont le lieu, identifié par sa carto nationale,
 *   n'est plus désiré ; ou, sans carto, dont l'id de lieu n'est plus désiré.
 * - À créer : un lieu désiré à id interne pas encore rattaché ; ou sans id mais
 *   avec une carto nationale ; ou sans id ni carto mais nommé (nouveau lieu).
 */
export const reconcilierLieuxActivite = <T extends LieuActiviteDesire>(
  existants: readonly LieuActiviteExistant[],
  desires: readonly T[],
): Reconciliation<T> => {
  const cartoIdsDesires = new Set(
    desires
      .map(
        ({ structureCartographieNationaleId }) =>
          structureCartographieNationaleId,
      )
      .filter(estDefini),
  )
  const idsDesires = new Set(desires.map(({ id }) => id).filter(estDefini))

  const aClaturer = existants
    .filter(
      ({ lieuInclusion }) =>
        (lieuInclusion.structureCartographieNationaleId != null &&
          !cartoIdsDesires.has(
            lieuInclusion.structureCartographieNationaleId,
          )) ||
        (lieuInclusion.structureCartographieNationaleId == null &&
          !idsDesires.has(lieuInclusion.id)),
    )
    .map(({ id }) => id)

  const idsLieuxExistants = new Set(
    existants.map(({ lieuInclusion }) => lieuInclusion.id),
  )

  const aCreer = desires.filter(
    ({ id, structureCartographieNationaleId, nom }) =>
      (id != null && !idsLieuxExistants.has(id)) ||
      (id == null && structureCartographieNationaleId != null) ||
      (id == null && structureCartographieNationaleId == null && nom != null),
  )

  return { aClaturer, aCreer }
}
