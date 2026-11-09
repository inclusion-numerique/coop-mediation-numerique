import {
  type Adresse,
  type Courriel,
  type FicheAccesLibre,
  type FormationsLabels,
  type FraisACharge,
  type Horaires,
  type Itinerances,
  type Localisation,
  type ModalitesAcces,
  type ModalitesAccompagnement,
  type Nom,
  type Pivot,
  type Presentation,
  type PrisesEnChargeSpecifiques,
  type PublicsSpecifiquementAdresses,
  type Services,
  type Telephone,
  type Typologies,
  type Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { BanId } from '../../../domain/ban-id'
import type { NomUsage } from '../../../domain/identite-sirene'
import type { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'

export type ModificationLieu =
  | {
      readonly section: 'InformationsGenerales'
      readonly nom: Nom
      readonly adresse: Adresse | null
      readonly localisation: Localisation | null
      readonly banId: BanId | null
      readonly itinerance: Itinerances
      readonly typologies: Typologies
      readonly pivot: Pivot | null
      readonly nomUsage: NomUsage | null
    }
  | {
      readonly section: 'VisibiliteCartographie'
      readonly visibilite: VisibiliteCartographie
    }
  | {
      readonly section: 'InformationsPratiques'
      readonly sitesWeb: readonly Url[]
      readonly ficheAccesLibre: FicheAccesLibre | null
      readonly priseRdv: Url | null
      readonly horaires: Horaires | null
    }
  | {
      readonly section: 'Description'
      readonly presentation: Presentation | null
      readonly formationsLabels: FormationsLabels
    }
  | {
      readonly section: 'ServicesEtAccompagnement'
      readonly services: Services
      readonly modalitesAccompagnement: ModalitesAccompagnement
    }
  | {
      readonly section: 'ModalitesAccesAuService'
      readonly modalitesAcces: ModalitesAcces
      readonly telephone: Telephone | null
      readonly courriels: readonly Courriel[]
      readonly fraisACharge: FraisACharge
    }
  | {
      readonly section: 'TypesDePublicsAccueillis'
      readonly publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses
      readonly priseEnChargeSpecifique: PrisesEnChargeSpecifiques
    }

export type SectionDeLaFiche = ModificationLieu['section']

export type Modification<Section extends SectionDeLaFiche> = Extract<
  ModificationLieu,
  { section: Section }
>
