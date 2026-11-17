import type {
  Adresse,
  Localisation,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { BanId } from '../../../domain/ban-id'
import type { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'
import type { LieuId } from '../../../domain/lieu-id'

export type AdresseValidee = {
  readonly adresse: Adresse
  readonly localisation: Localisation
  readonly banId: BanId
}

type Identite = {
  readonly nom: Nom
  readonly siret?: string | null
  readonly structureCartographieNationaleId?: IdentifiantCartographie | null
}

export type LieuExistant = Identite & {
  readonly id: LieuId
}

export type LieuACreer = Identite &
  AdresseValidee & {
    readonly id?: null
  }

export type LieuDemande = LieuExistant | LieuACreer

export const estExistant = (lieu: LieuDemande): lieu is LieuExistant =>
  lieu.id != null

export type LieuDejaRattache = {
  readonly id: LieuId
  readonly structureCartographieNationaleId: IdentifiantCartographie | null
}
