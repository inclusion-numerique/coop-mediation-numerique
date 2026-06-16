import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { Genre } from '@app/web/features/beneficiaire/domain/genre'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import type { TrancheAge } from '@app/web/features/beneficiaire/domain/tranche-age'
import type { ParticipantsAnonymes } from './participants-anonymes'
import type { RootUuid } from './root-uuid'

export type BeneficiaireAnonymeToCreate = {
  readonly id: BeneficiaireId
  readonly mediateurId: MediateurId
  readonly anonyme: true
  readonly attributionsAleatoires: true
  readonly trancheAge: TrancheAge
  readonly statutSocial: StatutSocial
  readonly genre: Genre
  readonly dejaAccompagne: boolean
}

export type CreateBeneficiairesForParticipantsAnonymes = (input: {
  participantsAnonymes: ParticipantsAnonymes
  mediateurId: MediateurId
  rootUuid?: RootUuid
}) => BeneficiaireAnonymeToCreate[]

export type CreateParticipantsAnonymesForBeneficiaires = <
  T extends {
    anonyme: boolean
    statutSocial: StatutSocial | null
    genre: Genre | null
    trancheAge: TrancheAge | null
    premierAccompagnement: boolean
  },
>(
  beneficiaires: readonly T[],
) => {
  participantsAnonymes: ParticipantsAnonymes
  beneficiairesSuivis: T[]
}
