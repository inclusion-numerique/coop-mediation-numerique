import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const trisDesLieux = [
  'nomaz',
  'nomza',
  'majrecent',
  'majancien',
] as const

export const TriDesLieux = defineModel(
  z
    .unknown()
    .pipe(z.enum(trisDesLieux).nullish().catch('nomaz'))
    .transform((valeur) => valeur ?? 'nomaz'),
)

export type TriDesLieux = Model.TypeOf<typeof TriDesLieux>

export const libellesDeTri: Record<TriDesLieux, string> = {
  nomaz: 'Nom (A à Z)',
  nomza: 'Nom (Z à A)',
  majrecent: 'MAJ récente',
  majancien: 'MAJ ancienne',
}

export const ordonnancement = (
  tri: TriDesLieux,
): { readonly champ: 'nom' | 'modification'; readonly sens: 'asc' | 'desc' } =>
  ordresParTri[tri]

const ordresParTri: Record<
  TriDesLieux,
  { readonly champ: 'nom' | 'modification'; readonly sens: 'asc' | 'desc' }
> = {
  nomaz: { champ: 'nom', sens: 'asc' },
  nomza: { champ: 'nom', sens: 'desc' },
  majrecent: { champ: 'modification', sens: 'desc' },
  majancien: { champ: 'modification', sens: 'asc' },
}
