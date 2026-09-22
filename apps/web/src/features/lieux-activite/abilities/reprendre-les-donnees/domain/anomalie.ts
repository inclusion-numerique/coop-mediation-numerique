export type Gravite = 'lieu-ecarte' | 'valeur-perdue' | 'a-verifier'

export type Anomalie = {
  readonly code: string
  readonly gravite: Gravite
  readonly champ: string
  readonly valeur: string
}

export const anomalie = (
  code: string,
  gravite: Gravite,
  champ: string,
  valeur: string,
): Anomalie => ({ code, gravite, champ, valeur })
