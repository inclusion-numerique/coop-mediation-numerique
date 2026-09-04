/** Les tris que propose l'annuaire des lieux. */
export const libellesDeTri = {
  nomaz: 'Alphabétique (A à Z)',
  nomza: 'Alphabétique (Z à A)',
  majrecent: 'Mise à jour récente',
  majancien: 'Mise à jour ancienne',
} as const

export type TriDeLAnnuaire = keyof typeof libellesDeTri

/**
 * Deux tris, deux colonnes, deux sens. La table dit lequel va avec lequel
 * plutôt que de le déduire deux fois, une par requête.
 */
const ordres = {
  nomaz: { colonne: 'nom', sens: 'ASC' },
  nomza: { colonne: 'nom', sens: 'DESC' },
  majrecent: { colonne: 'modification', sens: 'DESC' },
  majancien: { colonne: 'modification', sens: 'ASC' },
} as const satisfies Record<
  TriDeLAnnuaire,
  { colonne: 'nom' | 'modification'; sens: 'ASC' | 'DESC' }
>

export const ordonnancement = (tri: TriDeLAnnuaire | undefined) =>
  ordres[tri ?? 'nomaz']
