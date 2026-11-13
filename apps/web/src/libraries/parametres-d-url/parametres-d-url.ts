import { z } from 'zod'

export type ValeurDeParametre = string | readonly string[] | undefined

export type Periode = {
  readonly du: Date
  readonly au: Date
}

const JourIso = z.iso.date().transform((jour) => new Date(jour))

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

export const periodeLue = (
  du: ValeurDeParametre,
  au: ValeurDeParametre,
): Periode | null => {
  const debut = valeurLue(JourIso, premiereValeur(du))
  const fin = valeurLue(JourIso, premiereValeur(au))
  return debut === null || fin === null || debut > fin
    ? null
    : { du: debut, au: fin }
}

export const adresseAvec = (
  adresse: string,
  parametres: Readonly<Record<string, string | null | undefined>>,
): string => {
  const [chemin, requete = ''] = adresse.split('?')
  const valeurs = Object.entries({
    ...Object.fromEntries(new URLSearchParams(requete)),
    ...parametres,
  }).flatMap(([nom, valeur]) => (valeur == null ? [] : [[nom, valeur]]))
  const chaine = new URLSearchParams(valeurs).toString()
  return chaine === '' ? chemin : `${chemin}?${chaine}`
}
