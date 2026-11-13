import { Commune } from './commune'

export type CommuneComptee =
  | { readonly type: 'Renseignee'; readonly commune: Commune }
  | { readonly type: 'NonCommuniquee' }

const renseignee = (valeur: string | null): string | null =>
  valeur === null || valeur.trim() === '' ? null : valeur

export const communeComptee = (colonnes: {
  readonly nom: string | null
  readonly codePostal: string | null
  readonly codeInsee: string | null
}): CommuneComptee => {
  const nom = renseignee(colonnes.nom)
  const codePostal = renseignee(colonnes.codePostal)
  const codeInsee = renseignee(colonnes.codeInsee)
  const commune =
    nom === null || codePostal === null || codeInsee === null
      ? null
      : Commune.safe({ nom, codePostal, codeInsee })
  return commune === null
    ? { type: 'NonCommuniquee' }
    : { type: 'Renseignee', commune }
}
