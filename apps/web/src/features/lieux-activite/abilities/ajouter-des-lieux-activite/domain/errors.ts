/** Un lieu ne se rattache qu'à un médiateur : sans profil, rien à ajouter. */
export const MediateurRequis = {
  _tag: 'MediateurRequis',
} as const

/** Un panier vide n'est pas une demande d'ajout. */
export const PanierVide = {
  _tag: 'PanierVide',
} as const

export type EchecDAjout = typeof MediateurRequis | typeof PanierVide
