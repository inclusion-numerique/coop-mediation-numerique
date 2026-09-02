import type {
  Adresse,
  Contact,
  DispositifProgrammeNational,
  FormationLabel,
  Frais,
  Itinerance,
  Localisation,
  ModaliteAcces,
  ModaliteAccompagnement,
  Nom,
  Pivot,
  Presentation,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

/**
 * Ce que le lieu déclare de lui-même, dit dans les termes du schéma national.
 *
 * Aucun de ces modèles n'est redéfini ici : ils viennent de
 * `@gouvfr-anct/lieux-de-mediation-numerique`, d'où les tirent aussi mednum-cli
 * et les producteurs de données. Deux modélisations concurrentes du même objet,
 * ce serait deux vérités, et des contradictions qu'aucun arbitrage ne tranche au
 * moment de mettre les données en commun.
 *
 * `Fiche` est `LieuMediationNumerique` moins ce que l'enveloppe coop possède en
 * propre : l'identifiant, la date de mise à jour et la source.
 *
 * Trois champs y restent des chaînes nues — `horaires`, `structureParente` et
 * `autresFormationsLabels` — parce que le standard les laisse ainsi. Les
 * brander ici rouvrirait la seconde vérité qu'on vient de fermer : `horaires`
 * en particulier suit le format OSM `opening_hours`, dont le parseur rejette
 * les valeurs héritées des imports. Le parsing appartient aux presenters.
 */
export type Fiche = {
  readonly nom: Nom
  readonly pivot: Pivot | null
  /**
   * Le schéma national rend l'adresse obligatoire, la base non : 133 lieux
   * actifs n'en ont pas de valide — code postal vide, voie vide, ou
   * `[Non-Diffusible]` renvoyé par l'API Entreprise. 120 d'entre eux sont
   * rattachés à un médiateur et doivent rester lisibles, d'où l'absence
   * modélisée plutôt qu'une fiche qu'on refuserait de charger.
   */
  readonly adresse: Adresse | null
  readonly localisation: Localisation | null
  readonly typologies: readonly Typologie[]
  readonly contact: Contact
  readonly horaires: string | null
  readonly presentation: Presentation | null
  readonly structureParente: string | null
  readonly services: readonly Service[]
  readonly publicsSpecifiquementAdresses: readonly PublicSpecifiquementAdresse[]
  readonly priseEnChargeSpecifique: readonly PriseEnChargeSpecifique[]
  readonly modalitesAcces: readonly ModaliteAcces[]
  readonly fraisACharge: readonly Frais[]
  readonly itinerance: readonly Itinerance[]
  readonly dispositifProgrammesNationaux: readonly DispositifProgrammeNational[]
  readonly formationsLabels: readonly FormationLabel[]
  readonly autresFormationsLabels: readonly string[]
  readonly modalitesAccompagnement: readonly ModaliteAccompagnement[]
  readonly ficheAccesLibre: Url | null
  readonly priseRdv: Url | null
}
