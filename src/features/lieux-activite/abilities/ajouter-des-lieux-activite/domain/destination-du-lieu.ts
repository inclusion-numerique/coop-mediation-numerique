import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { Lieu } from '../../../domain/lieu'
import type { LieuCandidat } from '../../../domain/lieu-identite'
import type { LieuACreer } from './lieu-demande'

export type LieuConnu = {
  readonly _tag: 'LieuActif' | 'LieuARelever' | 'LieuPrevu'
  readonly id: LieuId
}

export type LieuNouveau<Creation> = {
  readonly _tag: 'LieuACreer'
  readonly id: LieuId
  readonly creation: Creation
}

export type DestinationDuLieu<Creation> = LieuConnu | LieuNouveau<Creation>

export type CreationDemandee = {
  readonly demande: LieuACreer
  readonly carto: Lieu | null
}

export type LieuCandidatCoop = LieuCandidat & { readonly id: LieuId }

export type Endroit = {
  readonly codeInsee: string
  readonly codePostal: string
}
