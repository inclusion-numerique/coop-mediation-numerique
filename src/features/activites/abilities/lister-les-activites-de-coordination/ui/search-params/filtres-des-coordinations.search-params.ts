import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'
import {
  listeEnParametre,
  listeSansLaValeur,
} from '@/libraries/parametres-d-url'

type RequeteLisible = { get(cle: string): string | null }

type Parametres = Readonly<Record<string, string | null>>

export const listeChoisie = (requete: RequeteLisible, cle: string): string[] =>
  requete.get(cle)?.split(',').filter(Boolean) ?? []

export const listeEnParametres = (
  cle: string,
  valeurs: readonly string[],
): Parametres => ({ [cle]: listeEnParametre(valeurs) })

export const periodeEnParametres = (du?: Date, au?: Date): Parametres =>
  du && au
    ? { du: dateAsIsoDay(du), au: dateAsIsoDay(au) }
    : { du: null, au: null }

export const sansLaValeurDesFiltres = (
  requete: RequeteLisible,
  cles: readonly string[],
  valeur?: string,
): Parametres =>
  Object.fromEntries(
    cles.map((cle) => [
      cle,
      valeur == null ? null : listeSansLaValeur(requete.get(cle), valeur),
    ]),
  )
