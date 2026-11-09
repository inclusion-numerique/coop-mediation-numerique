export const MediateurRequis = {
  _tag: 'MediateurRequis',
} as const

export const PanierVide = {
  _tag: 'PanierVide',
} as const

export type AdresseNonValidee = {
  readonly _tag: 'AdresseNonValidee'
  readonly nom: string
}

export const AdresseNonValidee = (nom: string): AdresseNonValidee => ({
  _tag: 'AdresseNonValidee',
  nom,
})

export type EchecDAjout =
  | typeof MediateurRequis
  | typeof PanierVide
  | AdresseNonValidee
