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

/**
 * L'adresse d'un lieu, telle que la Base Adresse Nationale l'a reconnue.
 *
 * Les sept champs vont ensemble : c'est leur présence conjointe qui atteste du
 * géocodage. Sans `banId`, rien ne distingue une adresse reconnue d'une adresse
 * saisie à l'estime.
 */
export type AdresseValidee = {
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string
  readonly banId: string
  readonly latitude: number
  readonly longitude: number
}

type Identite = {
  readonly nom: string
  /** Repris de l'annuaire des entreprises : la corrélation la plus sûre. */
  readonly siret?: string | null
  readonly structureCartographieNationaleId?: string | null
}

/**
 * Un lieu que la coop connaît déjà : il se rattache tel quel, et rien de son
 * adresse ne sera réécrit.
 */
export type LieuActiviteConnu = Identite & {
  readonly id: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee?: string | null
}

/**
 * Un lieu qu'il faudra créer, donc dont l'adresse doit avoir été validée. On
 * n'admet plus de lieu sans code INSEE, sans localisation ni sans `banId` : le
 * formulaire géocode l'adresse avant de l'ajouter, et refuse la sélection à
 * défaut.
 */
export type LieuActiviteACreer = Identite &
  AdresseValidee & { readonly id?: null }

/**
 * Lieu d'activité tel que soumis par le formulaire d'inscription : identité
 * (pour la réconciliation) puis, selon qu'il est connu ou non, ce qu'il faut
 * pour le rattacher ou pour le créer.
 */
export type LieuActiviteInput = LieuActiviteConnu | LieuActiviteACreer

export type Reconciliation<T> = {
  /** Ids des activités existantes à clôturer (plus dans la liste désirée). */
  readonly aCloturer: readonly string[]
  /** Lieux désirés à créer (pas encore rattachés). */
  readonly aCreer: readonly T[]
}

const estDefini = (valeur?: string | null): valeur is string => valeur != null

/**
 * Réconcilie l'ensemble des lieux d'activité : rend les activités à clôturer et
 * les lieux à créer pour que l'existant corresponde exactement au désiré.
 * Fonction pure : la couche appelante lit l'existant, résout les structures
 * carto et projette le résultat.
 *
 * Un lieu se reconnaît par DEUX identités indépendantes, et il suffit que l'une
 * corresponde pour qu'il s'agisse du même lieu : son id interne (la seule
 * certaine) et son id de cartographie nationale, annotation tardive posée par le
 * job nightly de la carto sur un lieu déjà créé. Selon d'où vient le lieu désiré
 * — les lieux déjà rattachés portent les deux, la recherche coop rend l'id
 * interne seul, la carto l'id carto seul — c'est l'une ou l'autre qui parle.
 *
 * - À clôturer : une activité dont le lieu ne correspond à AUCUN lieu désiré,
 *   par l'une ou l'autre de ses identités.
 * - À créer : un lieu désiré identifié (id, carto) ou nommé (nouveau lieu), et
 *   pas déjà rattaché par l'une ou l'autre de ses identités.
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

  const estDesire = ({ lieuInclusion }: LieuActiviteExistant) =>
    idsDesires.has(lieuInclusion.id) ||
    (estDefini(lieuInclusion.structureCartographieNationaleId) &&
      cartoIdsDesires.has(lieuInclusion.structureCartographieNationaleId))

  const aCloturer = existants
    .filter((existant) => !estDesire(existant))
    .map(({ id }) => id)

  const idsLieuxExistants = new Set(
    existants.map(({ lieuInclusion }) => lieuInclusion.id),
  )
  const cartoIdsLieuxExistants = new Set(
    existants
      .map(
        ({ lieuInclusion }) => lieuInclusion.structureCartographieNationaleId,
      )
      .filter(estDefini),
  )

  const estDejaRattache = ({ id, structureCartographieNationaleId }: T) =>
    (estDefini(id) && idsLieuxExistants.has(id)) ||
    (estDefini(structureCartographieNationaleId) &&
      cartoIdsLieuxExistants.has(structureCartographieNationaleId))

  const estIdentifie = ({ id, structureCartographieNationaleId, nom }: T) =>
    estDefini(id) || estDefini(structureCartographieNationaleId) || nom != null

  /**
   * Deux fois le même lieu dans la liste désirée, c'est une activité de trop.
   * Le filtre ci-dessus confronte chaque désir à l'EXISTANT ; il ne les confronte
   * pas entre eux, et un lieu qu'on n'a pas encore ne s'y oppose pas lui-même.
   *
   * L'identité est celle que ce type porte, et rien d'autre : l'id interne, l'id
   * de cartographie, ou la dénomination pour un lieu que rien n'identifie encore
   * — un même nom soumis deux fois dans une même liste désigne le même lieu, la
   * persistance le corrélant de toute façon sur son adresse.
   */
  const identite = ({
    id,
    structureCartographieNationaleId,
    nom,
  }: T): string =>
    estDefini(id)
      ? `id:${id}`
      : estDefini(structureCartographieNationaleId)
        ? `carto:${structureCartographieNationaleId}`
        : `nom:${nom}`

  const dejaVus = new Set<string>()
  const uneSeuleFois = (desire: T): boolean => {
    const cle = identite(desire)

    if (dejaVus.has(cle)) return false

    dejaVus.add(cle)

    return true
  }

  const aCreer = desires
    .filter((desire) => estIdentifie(desire) && !estDejaRattache(desire))
    .filter(uneSeuleFois)

  return { aCloturer, aCreer }
}
