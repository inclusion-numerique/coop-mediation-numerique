import { CodeInsee } from '@app/web/libraries/departement'

export type ValeurDeParametre = string | readonly string[] | undefined

export const premiereValeur = (
  valeur: ValeurDeParametre,
): string | undefined => (typeof valeur === 'string' ? valeur : valeur?.at(0))

export const communesLues = (valeur: ValeurDeParametre): readonly CodeInsee[] =>
  [valeur ?? []]
    .flat()
    .flatMap((liste) => liste.split(','))
    .flatMap((code) => {
      const commune = CodeInsee.safe(code)
      return commune === null ? [] : [commune]
    })
