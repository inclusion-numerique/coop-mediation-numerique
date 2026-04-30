import { genres } from '@app/web/features/beneficiaire/domain/genre'
import { statutsSociaux } from '@app/web/features/beneficiaire/domain/statut-social'
import { tranchesAge } from '@app/web/features/beneficiaire/domain/tranche-age'

type GenreCounters = {
  [K in (typeof genres)[number] as `genre${K}`]: number
}
type TrancheAgeCounters = {
  [K in (typeof tranchesAge)[number] as `trancheAge${K}`]: number
}
type StatutSocialCounters = {
  [K in (typeof statutsSociaux)[number] as `statutSocial${K}`]: number
}

export type ParticipantsAnonymes = {
  total: number
  dejaAccompagne: number
} & GenreCounters &
  TrancheAgeCounters &
  StatutSocialCounters

const toCounters = <T extends string>(
  prefix: string,
  values: readonly T[],
): Record<string, number> =>
  Object.fromEntries(values.map((value) => [`${prefix}${value}`, 0]))

export const participantsAnonymesDefault: ParticipantsAnonymes = {
  total: 0,
  dejaAccompagne: 0,
  ...toCounters('genre', genres),
  ...toCounters('trancheAge', tranchesAge),
  ...toCounters('statutSocial', statutsSociaux),
} as ParticipantsAnonymes
