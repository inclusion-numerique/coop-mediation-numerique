import type { GENRES, STATUTS_SOCIAUX, TRANCHES_D_AGE } from '../../domain'

export type Genre = (typeof GENRES)[number]

export type TrancheAge = (typeof TRANCHES_D_AGE)[number]

export type StatutSocial = (typeof STATUTS_SOCIAUX)[number]
