import { Genre, genres } from '@app/web/features/beneficiaire/domain/genre'
import {
  StatutSocial,
  statutsSociaux,
} from '@app/web/features/beneficiaire/domain/statut-social'
import {
  TrancheAge,
  tranchesAge,
} from '@app/web/features/beneficiaire/domain/tranche-age'
import { shuffle } from 'lodash-es'
import { v4 } from 'uuid'
import type { CreateBeneficiairesForParticipantsAnonymes } from './domain/creer-participants-anonymes'
import type { ParticipantsAnonymes } from './domain/participants-anonymes'

export const createCounterUuid = (root: string, index: number): string =>
  root.slice(0, -5) + index.toString(10).padStart(5, '0')

const expandValues = <T extends string>(
  counters: ParticipantsAnonymes,
  prefix: string,
  values: readonly T[],
): T[] =>
  values.flatMap((value) =>
    Array.from<T>({
      length: counters[
        `${prefix}${value}` as keyof ParticipantsAnonymes
      ] as number,
    }).fill(value),
  )

const padToLength = <T extends string>(
  values: T[],
  total: number,
  defaultValue: T,
): T[] => [
  ...values,
  ...Array.from<T>({ length: Math.max(0, total - values.length) }).fill(
    defaultValue,
  ),
]

export const createBeneficiairesForParticipantsAnonymes: CreateBeneficiairesForParticipantsAnonymes =
  ({ participantsAnonymes, rootUuid = v4(), mediateurId }) => {
    const { total } = participantsAnonymes

    const shuffledGenres = shuffle(
      padToLength(
        expandValues(participantsAnonymes, 'genre', [...genres]).map(Genre),
        total,
        Genre('NonCommunique'),
      ),
    )

    const shuffledTrancheAges = shuffle(
      padToLength(
        expandValues(participantsAnonymes, 'trancheAge', [...tranchesAge]).map(
          TrancheAge,
        ),
        total,
        TrancheAge('NonCommunique'),
      ),
    )

    const shuffledStatutsSociaux = shuffle(
      padToLength(
        expandValues(participantsAnonymes, 'statutSocial', [
          ...statutsSociaux,
        ]).map(StatutSocial),
        total,
        StatutSocial('NonCommunique'),
      ),
    )

    return Array.from({ length: total }, (_, index) => ({
      id: createCounterUuid(rootUuid, index),
      mediateurId,
      anonyme: true as const,
      attributionsAleatoires: true as const,
      genre: shuffledGenres[index],
      trancheAge: shuffledTrancheAges[index],
      statutSocial: shuffledStatutsSociaux[index],
      dejaAccompagne: index < participantsAnonymes.dejaAccompagne,
    }))
  }
