export const COLONNES_TRIABLES = [
  'nom',
  'creation',
  'modification',
  'mediateursEnActivite',
] as const

export type ColonneTriable = (typeof COLONNES_TRIABLES)[number]

export type CriteresDeLaListe = {
  readonly recherche?: string
  readonly tri?: {
    readonly colonne: ColonneTriable
    readonly ordre: 'asc' | 'desc'
  }
  readonly page: number
  readonly lignes: number
}
