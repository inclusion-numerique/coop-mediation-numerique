import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import type { GENRES, STATUTS_SOCIAUX, TRANCHES_D_AGE } from '../../domain'

export type Genre = (typeof GENRES)[number]

export type TrancheAge = (typeof TRANCHES_D_AGE)[number]

export type StatutSocial = (typeof STATUTS_SOCIAUX)[number]

export const genresAffiches = [
  'Masculin',
  'Feminin',
  'NonCommunique',
] as const satisfies readonly Genre[]

export const genreLabels: Readonly<Record<Genre, string>> = {
  Masculin: 'Masculin',
  Feminin: 'Féminin',
  NonCommunique: 'Non communiqué',
}

export const tranchesAgeAffichees = [
  'SoixanteDixPlus',
  'SoixanteSoixanteNeuf',
  'QuaranteCinquanteNeuf',
  'VingtCinqTrenteNeuf',
  'DixHuitVingtQuatre',
  'DouzeDixHuit',
  'MoinsDeDouze',
  'NonCommunique',
] as const satisfies readonly TrancheAge[]

export const trancheAgeLabels: Readonly<Record<TrancheAge, string>> = {
  SoixanteDixPlus: '70 ans et plus',
  SoixanteSoixanteNeuf: '60 - 69 ans',
  QuaranteCinquanteNeuf: '40 - 59 ans',
  VingtCinqTrenteNeuf: '25 - 39 ans',
  DixHuitVingtQuatre: '18 - 24 ans',
  DouzeDixHuit: '12 - 17 ans',
  MoinsDeDouze: 'Moins de 12 ans',
  NonCommunique: 'Non communiqué',
}

export const statutsSociauxAffiches = [
  'Retraite',
  'SansEmploi',
  'EnEmploi',
  'Scolarise',
  'NonCommunique',
] as const satisfies readonly StatutSocial[]

export const statutSocialLabels: Readonly<Record<StatutSocial, string>> = {
  Retraite: 'Retraité',
  SansEmploi: 'Sans emploi',
  EnEmploi: 'En emploi',
  Scolarise: 'Scolarisé',
  NonCommunique: 'Non communiqué ou hétérogène',
}

export const sexeLabels: Readonly<Record<Genre, string>> = {
  Masculin: 'Homme',
  Feminin: 'Femme',
  NonCommunique: 'Non communiqué',
}

export const genreOptions = labelsToOptions(genreLabels)

export const trancheAgeOptions = labelsToOptions(trancheAgeLabels)

export const statutSocialOptions = labelsToOptions(statutSocialLabels)
