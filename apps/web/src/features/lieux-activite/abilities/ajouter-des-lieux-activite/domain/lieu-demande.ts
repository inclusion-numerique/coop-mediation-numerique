/**
 * Un lieu que le médiateur demande à ajouter à son activité, tel que l'écran le
 * soumet.
 *
 * Trois provenances, un seul type : la recherche coop rend l'id interne, la
 * cartographie nationale rend son id à elle, et la création rend un nom et une
 * adresse géocodée sans aucun id. Les distinguer par une union serait plus
 * strict, mais le lieu n'a pas trois natures — il a jusqu'à deux identités et
 * une adresse, et c'est la matérialisation qui décide laquelle parle.
 */
export type LieuDemande = {
  /** Identité interne : la seule certaine. Absente pour un lieu à créer. */
  readonly id?: string | null
  /**
   * Identité de cartographie nationale : annotation tardive posée par le job
   * de synchronisation. Son absence ne dit rien de l'existence du lieu.
   */
  readonly structureCartographieNationaleId?: string | null
  readonly nom: string
  /** Repris de l'annuaire des entreprises : la corrélation la plus sûre. */
  readonly siret?: string | null
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee?: string | null
  /** Identifiant BAN de la voie, quand l'adresse a été géocodée. */
  readonly banId?: string | null
  readonly latitude?: number | null
  readonly longitude?: number | null
}

/** Ce à quoi le médiateur est déjà rattaché, réduit aux signaux d'identité. */
export type LieuDejaRattache = {
  readonly id: string
  readonly structureCartographieNationaleId: string | null
}
