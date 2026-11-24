import { Sort, type SortDirection } from '@arckit/resultset'
import { createLoader, createSerializer, type ParserMap } from 'nuqs/server'
import { paginate } from './fenetre-de-pages'
import {
  etiquettesDe,
  type FiltreQuelconque,
  type Libelles,
  type Valeurs,
} from './filtre'
import type { PaginationLue } from './pagination'
import type { TriParmi } from './tri-parmi'

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

type LueDe<F> = F extends { readonly lire: (brutes: never) => infer V }
  ? V
  : F extends { readonly parametres: infer P extends ParserMap }
    ? Valeurs<P>
    : never

type ValeursComposees<Fs extends readonly unknown[]> = SansIndex<
  EnUn<LueDe<Fs[number]>>
>

type PieceLueQuelconque = {
  readonly _tag: 'Recherche' | 'Tri' | 'Pagination'
  readonly parametres: ParserMap
  readonly lire: (brutes: never) => object
  readonly ecrire: (lue: never) => Readonly<Record<string, unknown>>
}

type PieceQuelconque = FiltreQuelconque | PieceLueQuelconque

export type LienDeTri = {
  readonly href: string
  readonly actif: boolean
  readonly ordre: SortDirection
}

type LienDePage =
  | {
      readonly numero: number
      readonly courante: boolean
      readonly href: string
    }
  | { readonly ellipse: string }

export type LiensDePagination = {
  readonly pages: readonly LienDePage[]
  readonly premiere: string | null
  readonly precedente: string | null
  readonly suivante: string | null
  readonly derniere: string | null
}

type PageDeResultats = {
  readonly totalItems: number
  readonly currentPage: number
  readonly pageSize: number
}

type ColonneDe<T> = T extends TriParmi<infer C> ? C : never

type CapaciteDeTri<C extends string, V> = {
  readonly liens: (
    courante: AdresseCourante,
    valeurs: V,
  ) => Readonly<Record<C, LienDeTri>>
  readonly lien: (
    courante: AdresseCourante,
    valeurs: V,
    colonne: C,
  ) => LienDeTri
}

type CapaciteDePagination = {
  readonly liens: (
    courante: AdresseCourante,
    resultat: PageDeResultats,
  ) => LiensDePagination
}

type CapaciteDeFiltres<V> = {
  readonly etiquettes: (
    courante: AdresseCourante,
    valeurs: V,
    libelles?: Libelles,
  ) => readonly EtiquetteAffichee[]
}

type CapaciteDEffacement = {
  readonly sansFiltres: (courante: AdresseCourante) => string
}

type Capacites<Fs extends readonly unknown[]> = ([
  Extract<Fs[number], { readonly _tag: 'Tri' }>,
] extends [never]
  ? unknown
  : {
      readonly tri: CapaciteDeTri<
        ColonneDe<Extract<Fs[number], { readonly _tag: 'Tri' }>>,
        ValeursComposees<Fs>
      >
    }) &
  ([Extract<Fs[number], { readonly _tag: 'Pagination' }>] extends [never]
    ? unknown
    : { readonly pagination: CapaciteDePagination }) &
  ([Extract<Fs[number], { readonly etiquettes: unknown }>] extends [never]
    ? unknown
    : CapaciteDeFiltres<ValeursComposees<Fs>>) &
  ([
    Extract<
      Fs[number],
      { readonly etiquettes: unknown } | { readonly _tag: 'Recherche' }
    >,
  ] extends [never]
    ? unknown
    : CapaciteDEffacement)

type EtatCompose<Fs extends readonly unknown[]> = {
  readonly parametres: ParametresComposes<Fs>
  readonly charger: (
    lus: ParametresBruts | URLSearchParams | string,
  ) => ValeursComposees<Fs>
  readonly adresse: (
    courante: AdresseCourante,
    valeurs: Partial<ValeursComposees<Fs>>,
  ) => string
  readonly requete: (valeurs: Partial<ValeursComposees<Fs>>) => string
  readonly parametresDe: (
    valeurs: Partial<ValeursComposees<Fs>>,
  ) => Readonly<Record<string, string>>
} & Capacites<Fs>

type ParametresBruts = Readonly<
  Record<string, string | readonly string[] | undefined>
>

export type AdresseCourante = {
  readonly chemin: string
  readonly parametres: ParametresBruts
}

export type EtiquetteAffichee = {
  readonly titre: string
  readonly prefixe: string
  readonly libelle: string
  readonly href: string
}

const depuisLaRequete = (requete: URLSearchParams): ParametresBruts =>
  Object.fromEntries(
    [...new Set(requete.keys())].map((cle) => [cle, requete.getAll(cle)]),
  )

const enParametresBruts = (
  lus: ParametresBruts | URLSearchParams | string,
): ParametresBruts =>
  typeof lus === 'string'
    ? depuisLaRequete(new URLSearchParams(lus))
    : lus instanceof URLSearchParams
      ? depuisLaRequete(lus)
      : lus

const elements = (valeur: string | readonly string[]): readonly string[] =>
  [valeur]
    .flat()
    .flatMap((liste) => liste.split(','))
    .map((element) => element.trim())
    .filter((element) => element !== '')

const enListes = (
  parametres: ParametresBruts,
  textes: readonly string[],
): Record<string, string | undefined> =>
  Object.fromEntries(
    Object.entries(parametres).map(([cle, valeur]) => [
      cle,
      valeur === undefined
        ? undefined
        : textes.includes(cle)
          ? [valeur].flat().at(0)
          : elements(valeur).join(','),
    ]),
  )

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

const estUnFiltre = (piece: PieceQuelconque): piece is FiltreQuelconque =>
  'etiquettes' in piece

const clesDe = (pieces: readonly PieceQuelconque[]): readonly string[] =>
  pieces.flatMap((piece) => Object.keys(piece.parametres))

const choisies = (
  valeurs: object,
  cles: readonly string[],
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(valeurs).filter(([cle]) => cles.includes(cle)),
  )

const lue = (piece: PieceQuelconque, brutes: object): object =>
  estUnFiltre(piece)
    ? choisies(brutes, Object.keys(piece.parametres))
    : (piece.lire as (brutes: object) => object)(brutes)

const ecrite = (
  piece: PieceQuelconque,
  valeurs: object,
): Readonly<Record<string, unknown>> =>
  estUnFiltre(piece)
    ? choisies(valeurs, Object.keys(piece.parametres))
    : (piece.ecrire as (lue: object) => Readonly<Record<string, unknown>>)(
        valeurs,
      )

const oppose = (sens: SortDirection): SortDirection =>
  sens === 'desc' ? 'asc' : 'desc'

export const composerLEtat = <const Fs extends readonly PieceQuelconque[]>(
  ...pieces: [EnDouble<Fs>] extends [never]
    ? Fs
    : { [I in keyof Fs]: `Clé d’URL en double : ${EnDouble<Fs> & string}` }
): EtatCompose<Fs> => {
  const liste: readonly PieceQuelconque[] = pieces
  const filtres = liste.filter(estUnFiltre)
  const recherches = liste.filter(
    (piece) => !estUnFiltre(piece) && piece._tag === 'Recherche',
  )
  const tri = liste.find(
    (piece): piece is PieceLueQuelconque & TriParmi<string> =>
      !estUnFiltre(piece) && piece._tag === 'Tri',
  )
  const parametres = Object.assign(
    {},
    ...liste.map((piece) => piece.parametres),
  ) as ParametresComposes<Fs>
  const serialiser = createSerializer(parametres)
  const lire = createLoader(parametres)
  const clesDesFiltres = clesDe(filtres)
  const clesEffacees = [...clesDesFiltres, ...clesDe(recherches)]
  const textes = clesDe(recherches)

  const base = (
    { chemin, parametres: bruts }: AdresseCourante,
    effacees: readonly string[],
  ): string => {
    const requete = requeteSans(bruts, [
      ...CLES_REMISES_A_ZERO,
      ...effacees,
    ]).toString()
    return requete === '' ? chemin : `${chemin}?${requete}`
  }

  const enBrutes = (valeurs: object): object =>
    Object.assign({}, ...liste.map((piece) => ecrite(piece, valeurs)))

  const adresse = (courante: AdresseCourante, valeurs: object): string =>
    serialiser(base(courante, []), enBrutes(valeurs) as never)

  const charger = (lus: ParametresBruts | URLSearchParams | string) => {
    const brutes = lire(enListes(enParametresBruts(lus), textes))
    return Object.assign({}, ...liste.map((piece) => lue(piece, brutes)))
  }

  const lienDeTri = (
    courante: AdresseCourante,
    valeurs: { readonly tri: Sort<string> },
    colonne: string,
  ): LienDeTri => {
    const actif = valeurs.tri.field === colonne
    const ordre = actif ? oppose(valeurs.tri.direction) : 'asc'
    return {
      href: adresse(courante, { tri: Sort(colonne, ordre) }),
      actif,
      ordre,
    }
  }

  const liensDePagination = (
    courante: AdresseCourante,
    { totalItems, currentPage, pageSize }: PageDeResultats,
  ): LiensDePagination => {
    const { pages, lastPage, previousPage, nextPage } = paginate({
      itemsCount: totalItems,
      pageSize,
      currentPage,
      boundaryCount: 1,
    })
    const vers = (page: number): string =>
      adresse(courante, {
        pagination: { page, pageSize } as PaginationLue,
      })
    const premiere = currentPage <= 1
    const derniere = currentPage >= lastPage
    return {
      pages: pages.map((page) =>
        'spacer' in page
          ? { ellipse: page.spacer }
          : {
              numero: page.number,
              courante: page.isCurrent,
              href: vers(page.number),
            },
      ),
      premiere: premiere ? null : vers(1),
      precedente: premiere ? null : vers(previousPage),
      suivante: derniere ? null : vers(nextPage),
      derniere: derniere ? null : vers(lastPage),
    }
  }

  return {
    parametres,
    charger,
    adresse,
    requete: (valeurs: object): string =>
      serialiser(enBrutes(valeurs) as never).replace(/^\?/, ''),
    parametresDe: (valeurs: object): Readonly<Record<string, string>> =>
      Object.fromEntries(
        new URLSearchParams(serialiser(enBrutes(valeurs) as never)),
      ),
    sansFiltres: (courante: AdresseCourante): string =>
      base(courante, clesEffacees),
    etiquettes: (
      courante: AdresseCourante,
      valeurs: object,
      libelles: Libelles = {},
    ): readonly EtiquetteAffichee[] =>
      filtres.flatMap((filtre) =>
        etiquettesDe(filtre, valeurs, libelles).map(({ libelle, sans }) => ({
          titre: filtre.titre,
          prefixe: filtre.prefixe ?? '',
          libelle,
          href: adresse(courante, {
            ...choisies(valeurs, clesDesFiltres),
            ...sans,
          }),
        })),
      ),
    tri: {
      liens: (
        courante: AdresseCourante,
        valeurs: { readonly tri: Sort<string> },
      ) =>
        Object.fromEntries(
          (tri?.colonnes ?? []).map((colonne) => [
            colonne,
            lienDeTri(courante, valeurs, colonne),
          ]),
        ),
      lien: lienDeTri,
    },
    pagination: { liens: liensDePagination },
  } as unknown as EtatCompose<Fs>
}
