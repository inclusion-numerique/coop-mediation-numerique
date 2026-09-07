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
 * Ce que la cartographie nationale apporte à un lieu que la coop matérialise :
 * sa fiche, et rien de plus.
 *
 * L'adresse n'en fait pas partie, ni les coordonnées. La cartographie ne porte
 * pas d'identifiant BAN, donc rien n'y distingue une adresse reconnue d'une
 * adresse saisie à l'estime ; celle de l'écran, validée, prime toujours. Les
 * porter ici revenait à les calculer pour les écraser.
 *
 * Le pivot non plus : le schéma national le prévoit, mais la cartographie n'est
 * pas une source fiable d'immatriculation — seule l'API Entreprise fait foi.
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
 * des sources hétérogènes, dont certaines ne renseignent ni horaires, ni
 * présentation.
 */
export type CartoStructure = {
  readonly id: string
  readonly nom: string
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
