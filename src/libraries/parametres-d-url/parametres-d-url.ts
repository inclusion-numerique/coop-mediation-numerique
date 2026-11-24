import { z } from 'zod'

export type ValeurDeParametre = string | readonly string[] | undefined

export type Periode = {
  readonly du: Date
  readonly au: Date
}

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

const EntierPositif = z.coerce.number().int().positive()

export const entierPositifLu = (
  valeur: string | undefined,
  parDefaut: number,
): number => valeurLue(EntierPositif, valeur) ?? parDefaut

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

type RequeteCourante = string | { toString(): string }

export const listeEnParametre = (valeurs: readonly string[]): string | null =>
  valeurs.length > 0 ? valeurs.join(',') : null

export const listeSansLaValeur = (
  liste: string | null | undefined,
  valeur: string,
): string | null =>
  listeEnParametre(
    (liste ?? '')
      .split(',')
      .filter((restante) => restante !== '' && restante !== valeur),
  )

export const requeteAvec = (
  requete: RequeteCourante,
  parametres: Changements,
): `?${string}` => `?${fusionnee(requete.toString(), parametres)}`

export const requeteConservant = (
  requete: RequeteCourante,
  cles: readonly string[],
): `?${string}` =>
  `?${new URLSearchParams(
    [...new URLSearchParams(requete.toString())].filter(([cle]) =>
      cles.includes(cle),
    ),
  ).toString()}`

export const requeteDeRecherche = (
  etat: Readonly<Record<string, unknown>>,
  recherche: string,
): `?${string}` =>
  requeteAvec(
    '',
    Object.fromEntries(
      Object.entries({ ...etat, recherche }).map(([cle, valeur]) => [
        cle,
        typeof valeur === 'string' && valeur !== '' ? valeur : null,
      ]),
    ),
  )
