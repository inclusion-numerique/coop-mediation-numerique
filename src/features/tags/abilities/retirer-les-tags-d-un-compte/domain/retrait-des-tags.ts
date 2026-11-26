import type { CodeDepartement } from '@/libraries/insee'
import type {
  DescriptionDuTag,
  MediateurId,
  NomDuTag,
  TagId,
} from '../../../domain'

export type CopieDeTag = {
  readonly mediateurId: MediateurId
  readonly nom: NomDuTag
  readonly description: DescriptionDuTag | null
  readonly departement: CodeDepartement | null
  readonly depuis: readonly TagId[]
}

export type RepriseDeTag = {
  readonly depuis: TagId
  readonly mediateurId: MediateurId
  readonly vers: TagId
}

export type RetraitDesTags = {
  readonly supprimeLe: Date
  readonly supprimes: readonly TagId[]
  readonly copies: readonly CopieDeTag[]
  readonly reprises: readonly RepriseDeTag[]
}

export type BilanDuRetrait = {
  readonly transferes: number
  readonly supprimes: number
}

export const bilanDuRetrait = ({
  supprimes,
  copies,
  reprises,
}: RetraitDesTags): BilanDuRetrait => ({
  transferes:
    reprises.length +
    copies.reduce((total, { depuis }) => total + depuis.length, 0),
  supprimes: supprimes.length,
})
