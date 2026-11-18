import type {
  Adresse,
  Courriel,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'
import type { LieuId } from '../../../domain/lieu-id'
import type { MediateurId } from '../../../domain/mediateur-id'

export type ChampsPartageables = {
  readonly employesIds: readonly string[]
  readonly mediateursEnActiviteIds: readonly MediateurId[]
  readonly activitesEmployeurIds: readonly string[]
  readonly activitesLieuIds: readonly string[]
  readonly typologies: readonly string[]
  readonly services: readonly string[]
  readonly publicsSpecifiquementAdresses: readonly string[]
  readonly priseEnChargeSpecifique: readonly string[]
  readonly fraisACharge: readonly string[]
  readonly dispositifProgrammesNationaux: readonly string[]
  readonly formationsLabels: readonly string[]
  readonly autresFormationsLabels: readonly string[]
  readonly itinerance: readonly string[]
  readonly modalitesAcces: readonly string[]
  readonly modalitesAccompagnement: readonly string[]
  readonly courriels: readonly Courriel[]
}

export type LieuAFusionner = ChampsPartageables & {
  readonly id: LieuId
  readonly nom: Nom
  readonly adresse: Adresse | null
  readonly siret: string | null
  readonly rna: string | null
  readonly structureCartographieNationaleId: IdentifiantCartographie | null
}
