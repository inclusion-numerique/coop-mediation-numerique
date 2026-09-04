/**
 * L'adresse d'un lieu, telle que la Base Adresse Nationale l'a reconnue.
 *
 * Les quatre champs vont ensemble et ne sont jamais absents : c'est ce qui
 * distingue une adresse validée d'une adresse saisie à l'estime. Sans `banId`,
 * rien ne permet de dire laquelle des deux on tient.
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
  /**
   * Identité de cartographie nationale : annotation tardive posée par le job de
   * synchronisation. Son absence ne dit rien de l'existence du lieu.
   */
  readonly structureCartographieNationaleId?: string | null
}

/**
 * Un lieu que la coop connaît déjà, désigné par son identité interne — la seule
 * certaine. Rien ne sera écrit de son adresse : il n'y a qu'à s'y rattacher,
 * et son adresse, fût-elle incomplète, ne regarde pas cet ajout.
 */
export type LieuExistant = Identite & {
  readonly id: string
  readonly adresse?: string | null
  readonly commune?: string | null
  readonly codePostal?: string | null
  readonly codeInsee?: string | null
}

/**
 * Un lieu qu'il faudra créer, donc dont l'adresse doit avoir été validée.
 *
 * On n'admet plus de lieu sans code INSEE, sans localisation ni sans `banId` :
 * un lieu de médiation est d'abord un endroit, et un endroit qu'on ne sait pas
 * situer n'apparaît sur aucune carte. L'écran valide l'adresse contre la BAN
 * avant de mettre le lieu au panier, et refuse la sélection à défaut.
 */
export type LieuACreer = Identite &
  AdresseValidee & {
    readonly id?: null
  }

/**
 * Un lieu que le médiateur demande à ajouter à son activité, tel que l'écran le
 * soumet. Deux natures, distinguées par la seule chose qui les sépare
 * vraiment : sait-on déjà de quel lieu de la coop il s'agit ?
 */
export type LieuDemande = LieuExistant | LieuACreer

export const estExistant = (lieu: LieuDemande): lieu is LieuExistant =>
  lieu.id != null

/** Ce à quoi le médiateur est déjà rattaché, réduit aux signaux d'identité. */
export type LieuDejaRattache = {
  readonly id: string
  readonly structureCartographieNationaleId: string | null
}
