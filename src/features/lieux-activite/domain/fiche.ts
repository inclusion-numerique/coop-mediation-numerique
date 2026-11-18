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

export type Fiche = {
  readonly nom: Nom
  readonly pivot: Pivot | null
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
