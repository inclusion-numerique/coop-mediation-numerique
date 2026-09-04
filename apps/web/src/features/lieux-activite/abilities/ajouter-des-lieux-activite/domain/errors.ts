/** Un lieu ne se rattache qu'à un médiateur : sans profil, rien à ajouter. */
export const MediateurRequis = {
  _tag: 'MediateurRequis',
} as const

/** Un panier vide n'est pas une demande d'ajout. */
export const PanierVide = {
  _tag: 'PanierVide',
} as const

/**
 * Un lieu à créer dont l'adresse n'a pas été reconnue par la Base Adresse
 * Nationale. Le nom accompagne l'erreur : dans un panier de plusieurs lieux,
 * savoir lequel est refusé est tout ce dont l'utilisateur a besoin.
 */
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
