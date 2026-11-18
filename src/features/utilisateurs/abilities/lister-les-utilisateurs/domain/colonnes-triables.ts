import type { SortDirection } from '@arckit/resultset'

export const colonnesTriables = [
  'creation',
  'derniereConnexion',
  'derniereVisite',
  'nom',
  'courriel',
  'accompagnements',
  'lieuxActivite',
  'beneficiaires',
] as const

export type ColonneTriable = (typeof colonnesTriables)[number]

export const TRI_PAR_DEFAUT: {
  readonly colonne: ColonneTriable
  readonly ordre: SortDirection
} = { colonne: 'creation', ordre: 'desc' }
