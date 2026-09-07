import type {
  Adresse,
  Localisation,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { BanId } from '../../../domain/ban-id'
import type { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'
import type { LieuId } from '../../../domain/lieu-id'

/**
 * L'adresse d'un lieu, telle que la Base Adresse Nationale l'a reconnue.
 *
 * Les trois vont ensemble et ne sont jamais absents : c'est ce qui distingue
 * une adresse validée d'une adresse saisie à l'estime. Sans `banId`, rien ne
 * permet de dire laquelle des deux on tient.
 */
export type AdresseValidee = {
  readonly adresse: Adresse
  readonly localisation: Localisation
  readonly banId: BanId
}

type Identite = {
  readonly nom: Nom
  /**
   * Repris de l'annuaire des entreprises : la corrélation la plus sûre.
   *
   * Reste une chaîne, à dessein. Ce numéro a transité par le navigateur, et le
   * serveur ne peut pas distinguer celui que l'annuaire a rendu de celui qu'on
   * lui souffle. Le brander dirait vérifié ce dont on doute — c'est le job
   * `verifier-les-sirets-des-lieux` qui l'établit.
   */
  readonly siret?: string | null
  /**
   * Identité de cartographie nationale : annotation tardive posée par le job de
   * synchronisation. Son absence ne dit rien de l'existence du lieu.
   */
  readonly structureCartographieNationaleId?: IdentifiantCartographie | null
}

/**
 * Un lieu que la coop connaît déjà, désigné par son identité interne — la seule
 * certaine. Rien ne sera écrit de son adresse : il n'y a qu'à s'y rattacher,
 * et son adresse, fût-elle incomplète, ne regarde pas cet ajout.
 */
export type LieuExistant = Identite & {
  readonly id: LieuId
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
  readonly id: LieuId
  readonly structureCartographieNationaleId: IdentifiantCartographie | null
}
