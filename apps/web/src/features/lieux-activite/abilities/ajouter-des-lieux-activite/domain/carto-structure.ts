/**
 * Structure de la cartographie nationale, telle que l'Entrepôt la rend.
 *
 * Les listes y voyagent en chaînes séparées par `|` — c'est le format du schéma
 * national, pas une commodité de transport : la conversion vers les colonnes de
 * la coop appartient à l'implémentation.
 */
export type CartoStructure = {
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly pivot: string
  readonly codeInsee: string | null
  readonly complementAdresse: string | null
  readonly longitude: number | null
  readonly latitude: number | null
  readonly ficheAccesLibre: string | null
  readonly presentationDetail: string | null
  readonly presentationResume: string | null
  readonly horaires: string | null
  readonly source: string | null
  readonly siteWeb: string | null
  readonly typologie: string | null
  readonly modalitesAccompagnement: string | null
  readonly services: string | null
  readonly modalitesAcces: string | null
  readonly fraisACharge: string | null
  readonly itinerance: string | null
  readonly priseEnChargeSpecifique: string | null
  readonly publicsSpecifiquementAdresses: string | null
  readonly courriels: string | null
  readonly telephone: string | null
}
