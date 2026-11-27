import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
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

export const TrancheAge = defineModel(
  z
    .enum(tranchesAge)
    .nullish()
    .transform((value) => value ?? 'NonCommunique'),
)

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

const trancheAgeFromAnneeNaissance = (
  anneeNaissance: AnneeNaissance,
  maintenant: Date,
): TrancheAge =>
  TrancheAge(
    tranchesAgeParSeuil.find(
      ({ seuil }) => maintenant.getFullYear() - anneeNaissance < seuil,
    )?.tranche ?? 'SoixanteDixPlus',
  )

export const trancheAgeForBeneficiaire = (
  anneeNaissance: AnneeNaissance | null,
  trancheAgeSaisie: TrancheAge,
  maintenant: Date,
): TrancheAge =>
  anneeNaissance
    ? trancheAgeFromAnneeNaissance(anneeNaissance, maintenant)
    : trancheAgeSaisie

export const effectiveTrancheAge = (
  anneeNaissance: AnneeNaissance | null,
  trancheAge: TrancheAge | null,
  maintenant: Date,
): TrancheAge | null =>
  anneeNaissance === null
    ? trancheAge
    : trancheAgeFromAnneeNaissance(anneeNaissance, maintenant)
