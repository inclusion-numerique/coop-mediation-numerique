import {
  CodeInsee,
  CodePostal,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { LieuId } from './identifiants/lieu-id'
import type { LieuCandidat } from './lieu-identite'

export type LieuConnu = {
  readonly _tag: 'LieuActif' | 'LieuARelever' | 'LieuPrevu'
  readonly id: LieuId
}

type LieuNouveau<Creation> = {
  readonly _tag: 'LieuACreer'
  readonly id: LieuId
  readonly creation: Creation
}

export type DestinationDuLieu<Creation> = LieuConnu | LieuNouveau<Creation>

export type LieuCandidatCoop = LieuCandidat & { readonly id: LieuId }

export const Endroit = defineModel(
  z
    .object({ codeInsee: CodeInsee.schema, codePostal: CodePostal.schema })
    .readonly()
    .brand('Endroit'),
)

export type Endroit = Model.TypeOf<typeof Endroit>
