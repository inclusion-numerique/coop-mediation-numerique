import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const trisDesLieux = [
  'nomaz',
  'nomza',
  'majrecent',
  'majancien',
] as const

/**
 * Le tri demandé par l'URL. Une valeur inconnue — un lien périmé, une URL
 * bricolée — ne casse rien : elle retombe sur l'ordre alphabétique.
 */
export const TriDesLieux = defineModel(
  z
    .enum(trisDesLieux)
    .nullish()
    .catch('nomaz')
    .transform((valeur) => valeur ?? 'nomaz'),
)

export type TriDesLieux = Model.TypeOf<typeof TriDesLieux>

export const libellesDeTri: Record<TriDesLieux, string> = {
  nomaz: 'Nom (A à Z)',
  nomza: 'Nom (Z à A)',
  majrecent: 'MAJ récente',
  majancien: 'MAJ ancienne',
}

type Sens = 'asc' | 'desc'

/**
 * Le tri, dit dans les termes de la requête : sur quel champ du lieu, et dans
 * quel sens. La table évite la cascade de ternaires qu'était l'ancienne
 * dérivation.
 */
const ordresParTri: Record<
  TriDesLieux,
  { readonly champ: 'nom' | 'modification'; readonly sens: Sens }
> = {
  nomaz: { champ: 'nom', sens: 'asc' },
  nomza: { champ: 'nom', sens: 'desc' },
  majrecent: { champ: 'modification', sens: 'desc' },
  majancien: { champ: 'modification', sens: 'asc' },
}

export const ordonnancement = (tri: TriDesLieux) => {
  const { champ, sens } = ordresParTri[tri]

  return { lieuInclusion: { [champ]: sens } }
}
