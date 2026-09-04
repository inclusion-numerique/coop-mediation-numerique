import type {
  Frais,
  Itinerance,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

/**
 * Une structure de la cartographie nationale, telle que la coop la reçoit.
 *
 * Les listes sont des listes. L'Entrepôt les rend déjà en tableaux : les
 * assembler en chaînes séparées par `|` pour les redécouper au moment d'écrire
 * n'était qu'un aller-retour, et il coûtait un `as` par liste.
 *
 * Les valeurs sont celles du schéma national — l'adaptateur écarte ce qu'il ne
 * reconnaît pas — et leur traduction vers les colonnes de la coop appartient à
 * l'implémentation.
 *
 * Les `null` disent ce que la cartographie peut réellement taire : elle agrège
 * des sources hétérogènes, dont certaines ne renseignent ni coordonnées, ni
 * horaires, ni présentation.
 */
export type CartoStructure = {
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
  readonly complementAdresse: string | null
  /** Un point, ou rien : une latitude sans longitude ne situe personne. */
  readonly localisation: {
    readonly latitude: number
    readonly longitude: number
  } | null
  /**
   * SIRET ou RNA. Toujours nul en pratique : la cartographie n'est pas une
   * source fiable d'immatriculation, seule l'API Entreprise fait foi. Le champ
   * demeure parce que le schéma national le porte.
   */
  readonly pivot: string | null
  readonly ficheAccesLibre: string | null
  readonly presentationDetail: string | null
  readonly presentationResume: string | null
  readonly horaires: string | null
  readonly source: string | null
  readonly siteWeb: string | null
  readonly telephone: string | null
  readonly courriels: readonly string[]
  readonly typologies: readonly Typologie[]
  readonly services: readonly Service[]
  readonly modalitesAcces: readonly ModaliteAcces[]
  readonly modalitesAccompagnement: readonly ModaliteAccompagnement[]
  readonly publicsSpecifiquementAdresses: readonly PublicSpecifiquementAdresse[]
  readonly priseEnChargeSpecifique: readonly PriseEnChargeSpecifique[]
  readonly fraisACharge: readonly Frais[]
  readonly itinerance: readonly Itinerance[]
}
