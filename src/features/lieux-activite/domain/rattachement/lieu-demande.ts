import type {
  Adresse,
  Localisation,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { IdentifiantCartographie } from '../cartographie-nationale/ids-cartographie-nationale'
import type { BanId } from '../identifiants/ban-id'
import type { LieuId } from '../identifiants/lieu-id'

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
