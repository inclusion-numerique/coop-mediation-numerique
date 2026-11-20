/**
 * Un lieu à créer dont l'adresse n'a pas été reconnue par la Base Adresse
 * Nationale. Le nom accompagne l'erreur : dans une liste de plusieurs lieux,
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
