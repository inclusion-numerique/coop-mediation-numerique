import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'
import {
  adresseAvec,
  listeEnParametre,
  listeSansLaValeur,
} from '@/libraries/parametres-d-url'

type Parametres = Readonly<Record<string, string | null>>

type RequeteLisible = { get(cle: string): string | null }

export const typesEnParametres = (
  types: readonly string[],
  rdvs: readonly string[],
): Parametres => ({
  types: listeEnParametre(types),
  rdvs: listeEnParametre(rdvs),
})

export const periodeEnParametres = (du?: Date, au?: Date): Parametres =>
  du && au
    ? { du: dateAsIsoDay(du), au: dateAsIsoDay(au) }
    : { du: null, au: null }

export const choixEnParametres = (
  cle: 'mediateurs' | 'beneficiaires',
  valeurs: readonly string[],
): Parametres => ({ [cle]: listeEnParametre(valeurs), page: null })

export const lieuxEnParametres = ({
  lieux,
  communes,
  departements,
}: {
  readonly lieux: readonly string[]
  readonly communes: readonly string[]
  readonly departements: readonly string[]
}): Parametres => ({
  lieux: listeEnParametre(lieux),
  communes: listeEnParametre(communes),
  departements: listeEnParametre(departements),
  page: null,
})

export type CleDePlusDeFiltres =
  | 'conseiller_numerique'
  | 'structuresEmployeuses'
  | 'types'
  | 'thematiqueNonAdministratives'
  | 'thematiqueAdministratives'
  | 'tags'
  | 'source'

type ValeursDePlusDeFiltres = {
  readonly conseiller_numerique?: string
  readonly structuresEmployeuses?: readonly { readonly id: string }[]
  readonly types?: readonly string[]
  readonly thematiqueNonAdministratives?: readonly string[]
  readonly thematiqueAdministratives?: readonly string[]
  readonly tags?: string | readonly string[]
  readonly source?: string
}

const enListe = (valeur?: string | readonly string[]): readonly string[] =>
  valeur === undefined ? [] : typeof valeur === 'string' ? [valeur] : valeur

const valeurParmi = (
  valeur: string | undefined,
  admises: readonly string[],
): string | null =>
  valeur !== undefined && admises.includes(valeur) ? valeur : null

export const plusDeFiltresEnParametres = (
  valeurs: ValeursDePlusDeFiltres,
  cles: readonly CleDePlusDeFiltres[],
): Parametres => {
  const tous: Record<CleDePlusDeFiltres, string | null> = {
    conseiller_numerique: valeurParmi(valeurs.conseiller_numerique, ['0', '1']),
    structuresEmployeuses: listeEnParametre(
      (valeurs.structuresEmployeuses ?? []).map(({ id }) => id),
    ),
    types: listeEnParametre(valeurs.types ?? []),
    thematiqueNonAdministratives: listeEnParametre(
      valeurs.thematiqueNonAdministratives ?? [],
    ),
    thematiqueAdministratives: listeEnParametre(
      valeurs.thematiqueAdministratives ?? [],
    ),
    tags: listeEnParametre(enListe(valeurs.tags)),
    source: valeurParmi(valeurs.source, ['v1', 'v2']),
  }
  return Object.fromEntries(cles.map((cle) => [cle, tous[cle]]))
}

export const sansPlusDeFiltres = (
  cles: readonly CleDePlusDeFiltres[],
): Parametres => Object.fromEntries(cles.map((cle) => [cle, null]))

export const sansLeFiltre = (
  requete: RequeteLisible,
  cle: string,
  valeur: string | readonly string[],
): Parametres =>
  typeof valeur === 'string'
    ? cle === 'rdvs' && valeur === 'tous'
      ? { rdvs: null }
      : { [cle]: listeSansLaValeur(requete.get(cle), valeur) }
    : Object.fromEntries(valeur.map((parametre) => [parametre, null]))

export const adresseDesFiltres = (
  chemin: string,
  filtres: Readonly<
    Record<string, string | readonly string[] | null | undefined>
  >,
): string =>
  adresseAvec(
    chemin,
    Object.fromEntries(
      Object.entries(filtres).map(([cle, valeur]) => [
        cle,
        valeur == null || typeof valeur === 'string'
          ? valeur || null
          : listeEnParametre(valeur),
      ]),
    ),
  )
