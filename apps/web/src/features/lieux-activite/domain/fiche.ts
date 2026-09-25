import type {
  Adresse,
  Contact,
  DispositifProgrammesNationaux,
  FicheAccesLibre,
  FormationsLabels,
  FraisACharge,
  Horaires,
  Itinerances,
  Localisation,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  Pivot,
  Presentation,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Services,
  Typologies,
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
 * Deux champs y restent des chaînes nues — `horaires` et
 * `autresFormationsLabels` — parce que le standard les laisse ainsi. Les
 * brander ici rouvrirait la seconde vérité qu'on vient de fermer : `horaires`
 * en particulier suit le format OSM `opening_hours`, dont le parseur rejette
 * les valeurs héritées des imports. Le parsing appartient aux presenters.
 *
 * `structure_parente` n'y figure pas : la colonne existe et l'API v1 la publie,
 * mais aucune ligne ne la renseigne et rien ne l'écrit. La porter dans le
 * domaine reviendrait à la traîner dans chaque ability sans jamais rien en
 * lire.
 */
export type Fiche = {
  readonly nom: Nom
  readonly pivot: Pivot | null
  /**
   * Le schéma national rend l'adresse obligatoire, la base non : 133 lieux
   * actifs n'en ont pas de valide — code postal vide, ou voie vide. 120
   * d'entre eux sont rattachés à un médiateur et doivent rester lisibles,
   * d'où l'absence modélisée plutôt qu'une fiche qu'on refuserait de charger.
   */
  readonly adresse: Adresse | null
  readonly localisation: Localisation | null
  readonly typologies: Typologies
  readonly contact: Contact
  readonly horaires: Horaires | null
  readonly presentation: Presentation | null
  readonly services: Services
  readonly publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses
  readonly priseEnChargeSpecifique: PrisesEnChargeSpecifiques
  readonly modalitesAcces: ModalitesAcces
  readonly fraisACharge: FraisACharge
  readonly itinerance: Itinerances
  readonly dispositifProgrammesNationaux: DispositifProgrammesNationaux
  readonly formationsLabels: FormationsLabels
  readonly autresFormationsLabels: readonly string[]
  readonly modalitesAccompagnement: ModalitesAccompagnement
  readonly ficheAccesLibre: FicheAccesLibre | null
  readonly priseRdv: Url | null
}
