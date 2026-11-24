import { createLoader, createSerializer, type ParserMap } from 'nuqs/server'
import {
  etiquettesDe,
  type FiltreQuelconque,
  type Libelles,
  type Valeurs,
} from './filtre'

export const CLES_REMISES_A_ZERO = ['page'] as const

type ParametresDe<F> = F extends { readonly parametres: infer P } ? P : never

type ClesDe<F> = keyof ParametresDe<F>

type EnDouble<
  Fs extends readonly unknown[],
  Vues = never,
> = Fs extends readonly [infer Premier, ...infer Suite]
  ? [ClesDe<Premier> & Vues] extends [never]
    ? EnDouble<Suite, Vues | ClesDe<Premier>>
    : ClesDe<Premier> & Vues
  : never

type EnUn<U> = (U extends unknown ? (u: U) => void : never) extends (
  i: infer I,
) => void
  ? I
  : never

type ParametresComposes<Fs extends readonly unknown[]> = EnUn<
  ParametresDe<Fs[number]>
> &
  ParserMap

type SansIndex<T> = {
  [K in keyof T as string extends K ? never : K]: T[K]
}

export type ValeursComposees<Fs extends readonly unknown[]> = SansIndex<
  Valeurs<ParametresComposes<Fs>>
>

type ParametresBruts = Readonly<
  Record<string, string | readonly string[] | undefined>
>

export type AdresseCourante = {
  readonly chemin: string
  readonly parametres: ParametresBruts
}

export type EtiquetteAffichee = {
  readonly titre: string
  readonly libelle: string
  readonly href: string
}

const requeteSans = (
  parametres: ParametresBruts,
  cles: readonly string[],
): URLSearchParams =>
  new URLSearchParams(
    Object.entries(parametres)
      .filter(([cle]) => !cles.includes(cle))
      .flatMap(([cle, valeur]) =>
        [valeur ?? []].flat().map((une): [string, string] => [cle, une]),
      ),
  )

export const composerLesFiltres = <
  const Fs extends readonly FiltreQuelconque[],
>(
  ...filtres: [EnDouble<Fs>] extends [never]
    ? Fs
    : { [I in keyof Fs]: `Clé d’URL en double : ${EnDouble<Fs> & string}` }
) => {
  const liste: readonly FiltreQuelconque[] = filtres
  const parametres = Object.assign(
    {},
    ...liste.map((filtre) => filtre.parametres),
  ) as ParametresComposes<Fs>
  const serialiser = createSerializer(parametres)
  const lire = createLoader(parametres)
  const clesDesFiltres = Object.keys(parametres)

  const base = (
    { chemin, parametres: bruts }: AdresseCourante,
    sansLesFiltres: boolean,
  ): string => {
    const requete = requeteSans(bruts, [
      ...CLES_REMISES_A_ZERO,
      ...(sansLesFiltres ? clesDesFiltres : []),
    ]).toString()
    return requete === '' ? chemin : `${chemin}?${requete}`
  }

  const adresse = (
    courante: AdresseCourante,
    valeurs: Partial<ValeursComposees<Fs>>,
  ): string => serialiser(base(courante, false), valeurs as never)

  return {
    parametres,
    charger: (
      lus: ParametresBruts | URLSearchParams | string,
    ): ValeursComposees<Fs> => lire(lus as Record<string, string>),
    adresse,
    sansFiltres: (courante: AdresseCourante): string => base(courante, true),
    requete: (valeurs: Partial<ValeursComposees<Fs>>): string =>
      serialiser(valeurs as never).replace(/^\?/, ''),
    etiquettes: (
      courante: AdresseCourante,
      valeurs: ValeursComposees<Fs>,
      libelles: Libelles = {},
    ): readonly EtiquetteAffichee[] =>
      liste.flatMap((filtre) =>
        etiquettesDe(filtre, valeurs, libelles).map(({ libelle, sans }) => ({
          titre: filtre.titre,
          libelle,
          href: adresse(courante, { ...valeurs, ...sans } as never),
        })),
      ),
  }
}
