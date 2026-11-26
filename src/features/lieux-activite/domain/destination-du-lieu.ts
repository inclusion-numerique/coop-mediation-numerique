import type { LieuId } from './identifiants/lieu-id'
import type { LieuCandidat } from './lieu-identite'

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

export type LieuCandidatCoop = LieuCandidat & { readonly id: LieuId }

export type Endroit = {
  readonly codeInsee: string
  readonly codePostal: string
}
