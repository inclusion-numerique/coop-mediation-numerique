import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { AnneeNaissance } from './annee-naissance'

export const tranchesAge = [
  'SoixanteDixPlus',
  'SoixanteSoixanteNeuf',
  'QuaranteCinquanteNeuf',
  'VingtCinqTrenteNeuf',
  'DixHuitVingtQuatre',
  'DouzeDixHuit',
  'MoinsDeDouze',
  'NonCommunique',
] as const

export const TrancheAge = defineModel(z.enum(tranchesAge).brand('TrancheAge'))

export type TrancheAge = Model.TypeOf<typeof TrancheAge>

export const trancheAgeLabels: Record<TrancheAge, string> = {
  SoixanteDixPlus: '70 ans et plus',
  SoixanteSoixanteNeuf: '60 - 69 ans',
  QuaranteCinquanteNeuf: '40 - 59 ans',
  VingtCinqTrenteNeuf: '25 - 39 ans',
  DixHuitVingtQuatre: '18 - 24 ans',
  DouzeDixHuit: '12 - 17 ans',
  MoinsDeDouze: 'Moins de 12 ans',
  NonCommunique: 'Non communiqué',
}

const tranchesAgeParSeuil = [
  { seuil: 12, tranche: 'MoinsDeDouze' },
  { seuil: 18, tranche: 'DouzeDixHuit' },
  { seuil: 25, tranche: 'DixHuitVingtQuatre' },
  { seuil: 40, tranche: 'VingtCinqTrenteNeuf' },
  { seuil: 60, tranche: 'QuaranteCinquanteNeuf' },
  { seuil: 70, tranche: 'SoixanteSoixanteNeuf' },
] as const

const toAge = (anneeNaissance: AnneeNaissance): number =>
  new Date().getFullYear() - anneeNaissance

export const trancheAgeFromAnneeNaissance = (
  anneeNaissance: AnneeNaissance,
): TrancheAge =>
  TrancheAge(
    tranchesAgeParSeuil.find(({ seuil }) => toAge(anneeNaissance) < seuil)
      ?.tranche ?? 'SoixanteDixPlus',
  )
