import type { Genre } from '@app/web/features/beneficiaire/domain/genre'
import type { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import type { TrancheAge } from '@app/web/features/beneficiaire/domain/tranche-age'
import {
  type ParticipantsAnonymes,
  participantsAnonymesDefault,
} from './domain/participants-anonymes'
import type { CreateParticipantsAnonymesForBeneficiaires } from './domain/port'

type BeneficiaireInput = {
  anonyme: boolean
  statutSocial: StatutSocial | null
  genre: Genre | null
  trancheAge: TrancheAge | null
  premierAccompagnement: boolean
}

const incrementCounter = (
  counters: ParticipantsAnonymes,
  key: keyof ParticipantsAnonymes,
): ParticipantsAnonymes => ({
  ...counters,
  [key]: counters[key] + 1,
})

const aggregateAnonymeBeneficiaire = (
  counters: ParticipantsAnonymes,
  beneficiaire: BeneficiaireInput,
): ParticipantsAnonymes =>
  [
    'total' as const,
    ...(!beneficiaire.premierAccompagnement
      ? (['dejaAccompagne'] as const)
      : []),
    `genre${beneficiaire.genre ?? 'NonCommunique'}` as keyof ParticipantsAnonymes,
    `statutSocial${beneficiaire.statutSocial ?? 'NonCommunique'}` as keyof ParticipantsAnonymes,
    `trancheAge${beneficiaire.trancheAge ?? 'NonCommunique'}` as keyof ParticipantsAnonymes,
  ].reduce(incrementCounter, counters)

export const createParticipantsAnonymesForBeneficiaires: CreateParticipantsAnonymesForBeneficiaires =
  (beneficiaires) =>
    beneficiaires.reduce(
      (acc, beneficiaire) =>
        beneficiaire.anonyme
          ? {
              ...acc,
              participantsAnonymes: aggregateAnonymeBeneficiaire(
                acc.participantsAnonymes,
                beneficiaire,
              ),
            }
          : {
              ...acc,
              beneficiairesSuivis: [...acc.beneficiairesSuivis, beneficiaire],
            },
      {
        participantsAnonymes: { ...participantsAnonymesDefault },
        beneficiairesSuivis:
          [] as typeof beneficiaires extends readonly (infer T)[]
            ? T[]
            : never[],
      },
    )
