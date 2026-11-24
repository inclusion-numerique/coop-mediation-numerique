import type { SortDirection } from '@arckit/resultset'
import type { ParametresDeFiltres } from '@/features/utilisateurs/domain'
import type { DataTableUrlState } from '@/libraries/data-table'
import {
  listeEnParametre,
  listeSansLaValeur,
} from '@/libraries/parametres-d-url'

export type ParametresDeLaListe = {
  readonly recherche?: string
  readonly tri?: string
  readonly ordre?: string
  readonly page?: string
  readonly lignes?: string
} & ParametresDeFiltres

const ordreLu = (ordre?: string): SortDirection | undefined =>
  ordre === 'asc' || ordre === 'desc' ? ordre : undefined

export const etatDeLaTable = (
  parametres: ParametresDeLaListe,
): DataTableUrlState => ({ ...parametres, ordre: ordreLu(parametres.ordre) })

type Parametres = Readonly<Record<string, string | null>>

export const choixEnParametres = (
  parametre: string,
  valeur: string | null,
): Parametres => ({ [parametre]: valeur, page: null })

export const listeEnParametres = (
  parametre: string,
  valeurs: readonly string[],
): Parametres => ({ [parametre]: listeEnParametre(valeurs), page: null })

export const historiqueEnParametres = (cochee: boolean): Parametres => ({
  historique: cochee ? '1' : null,
  page: null,
})

export const sansLaValeur = (
  requete: { get(cle: string): string | null },
  parametre: string,
  valeur: string,
): Parametres => ({
  [parametre]: listeSansLaValeur(requete.get(parametre), valeur),
})
