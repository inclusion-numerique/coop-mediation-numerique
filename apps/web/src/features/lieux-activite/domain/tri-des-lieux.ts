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
 *
 * Ce vocabulaire vit au niveau de la feature parce que deux listes le
 * proposent : les lieux d'un médiateur et l'annuaire d'un département. Elles en
 * portaient chacune une copie, avec les mêmes quatre clés et des libellés
 * différents.
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

/**
 * Le tri, dit sur quel champ du lieu et dans quel sens — sans rien savoir de la
 * façon dont la requête l'exprimera. C'est à chaque implémentation de le
 * traduire dans ses termes : un `orderBy` Prisma ici, un `ORDER BY` brut là.
 */
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
