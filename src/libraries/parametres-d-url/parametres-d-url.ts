import { z } from 'zod'

export type ValeurDeParametre = string | readonly string[] | undefined

export const premiereValeur = (
  valeur: ValeurDeParametre,
): string | undefined => (typeof valeur === 'string' ? valeur : valeur?.at(0))

export const valeurLue = <S extends z.ZodType>(
  schema: S,
  valeur: unknown,
): z.output<S> | null => {
  const lue = schema.safeParse(valeur)
  return lue.success ? lue.data : null
}

export const valeursLues = <S extends z.ZodType>(
  schema: S,
  valeur: ValeurDeParametre,
): readonly z.output<S>[] =>
  [valeur ?? []]
    .flat()
    .flatMap((liste) => liste.split(','))
    .map((element) => element.trim())
    .filter((element) => element !== '')
    .flatMap((element) => {
      const lue = valeurLue(schema, element)
      return lue === null ? [] : [lue]
    })

type Changements = Readonly<Record<string, string | null | undefined>>

const fusionnee = (requete: string, parametres: Changements): string =>
  new URLSearchParams(
    Object.entries({
      ...Object.fromEntries(new URLSearchParams(requete)),
      ...parametres,
    }).flatMap(([nom, valeur]) => (valeur == null ? [] : [[nom, valeur]])),
  ).toString()

export const adresseAvec = (
  adresse: string,
  parametres: Changements,
): string => {
  const [chemin, requete = ''] = adresse.split('?')
  const chaine = fusionnee(requete, parametres)
  return chaine === '' ? chemin : `${chemin}?${chaine}`
}
