import {
  type Adresse,
  type Courriel,
  type FormationLabel,
  type Frais,
  type Itinerance,
  type Localisation,
  type ModaliteAcces,
  type ModaliteAccompagnement,
  type Nom,
  type Pivot,
  type Presentation,
  type PriseEnChargeSpecifique,
  type PublicSpecifiquementAdresse,
  type Service,
  type Typologie,
  type Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { BanId } from '../../../domain/ban-id'
import type { NomUsage } from '../../../domain/identite-sirene'
import type { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'

/**
 * La fiche d'un lieu se corrige section par section : chaque carte de la page
 * enregistre la sienne sans toucher aux autres. Une seule ability porte les
 * sept, parce qu'il n'y a qu'un écran et qu'elles partagent la même fiche.
 *
 * Le discriminant nomme la section éditée. Il rend inexprimable la mise à jour
 * partielle qui, dans le routeur tRPC, se faisait en réétalant toute la ligne
 * (`data: { ...structure, ...champsDeLaSection }`) : une écriture concurrente
 * sur une autre section était alors écrasée par une valeur relue avant elle.
 */
export type ModificationLieu =
  | {
      readonly section: 'InformationsGenerales'
      readonly nom: Nom
      readonly adresse: Adresse | null
      readonly localisation: Localisation | null
      readonly banId: BanId | null
      readonly itinerance: readonly Itinerance[]
      readonly typologies: readonly Typologie[]
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
      readonly ficheAccesLibre: Url | null
      readonly priseRdv: Url | null
      readonly horaires: string | null
    }
  | {
      readonly section: 'Description'
      readonly presentation: Presentation | null
      readonly formationsLabels: readonly FormationLabel[]
    }
  | {
      readonly section: 'ServicesEtAccompagnement'
      readonly services: readonly Service[]
      readonly modalitesAccompagnement: readonly ModaliteAccompagnement[]
    }
  | {
      readonly section: 'ModalitesAccesAuService'
      readonly modalitesAcces: readonly ModaliteAcces[]
      readonly telephone: string | null
      readonly courriels: readonly Courriel[]
      readonly fraisACharge: readonly Frais[]
    }
  | {
      readonly section: 'TypesDePublicsAccueillis'
      readonly publicsSpecifiquementAdresses: readonly PublicSpecifiquementAdresse[]
      readonly priseEnChargeSpecifique: readonly PriseEnChargeSpecifique[]
    }

export type SectionDeLaFiche = ModificationLieu['section']

export type Modification<Section extends SectionDeLaFiche> = Extract<
  ModificationLieu,
  { section: Section }
>
