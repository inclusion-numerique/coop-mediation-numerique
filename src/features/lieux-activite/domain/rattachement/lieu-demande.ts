import type {
  Adresse,
  Localisation,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Siret } from '@/libraries/insee'
import type { IdentifiantCartographie } from '../cartographie-nationale/ids-cartographie-nationale'
import type { BanId } from '../identifiants/ban-id'
import type { LieuId } from '../identifiants/lieu-id'

export type AdresseValidee = {
  readonly adresse: Adresse
  readonly localisation: Localisation
  readonly banId: BanId
}

export type IdentiteDuLieuDemande = {
  readonly nom: Nom
  readonly siret: Siret | null
  readonly structureCartographieNationaleId: IdentifiantCartographie | null
}

export type LieuExistant = IdentiteDuLieuDemande & {
  readonly _tag: 'LieuExistant'
  readonly id: LieuId
}

export type LieuACreer = IdentiteDuLieuDemande &
  AdresseValidee & {
    readonly _tag: 'LieuACreer'
  }

export type LieuDemande = LieuExistant | LieuACreer

export const estExistant = (lieu: LieuDemande): lieu is LieuExistant =>
  lieu._tag === 'LieuExistant'
