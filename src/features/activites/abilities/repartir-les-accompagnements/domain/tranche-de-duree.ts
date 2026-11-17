import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TRANCHES_DE_DUREE = [
  'MoinsDe30Minutes',
  'De30MinutesA1Heure',
  'De1HeureA2Heures',
  'DeuxHeuresEtPlus',
] as const

export const TrancheDeDuree = defineModel(
  z.enum(TRANCHES_DE_DUREE).brand('TrancheDeDuree'),
)

export type TrancheDeDuree = Model.TypeOf<typeof TrancheDeDuree>

export const tranchesDeDuree: readonly TrancheDeDuree[] =
  TRANCHES_DE_DUREE.map(TrancheDeDuree)

const BORNES_EN_MINUTES: Readonly<
  Record<
    (typeof TRANCHES_DE_DUREE)[number],
    { readonly depuis: number; readonly jusqua: number | null }
  >
> = {
  MoinsDe30Minutes: { depuis: 0, jusqua: 30 },
  De30MinutesA1Heure: { depuis: 30, jusqua: 60 },
  De1HeureA2Heures: { depuis: 60, jusqua: 120 },
  DeuxHeuresEtPlus: { depuis: 120, jusqua: null },
}

const lue =
  <K extends string, V>(table: Readonly<Record<K, V>>) =>
  (cle: K): V =>
    table[cle]

export const bornesEnMinutes = lue(BORNES_EN_MINUTES)
