import { z } from 'zod'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'
import {
  listeEnParametre,
  listeSansLaValeur,
  valeursLues,
} from '@/libraries/parametres-d-url'
import {
  type CriteresDesActivites,
  parametresDesActivitesDe,
  THEMATIQUES_RECHERCHEES,
} from '../../domain/index'
import {
  SOURCES_DANS_L_URL,
  type SourceDansLURL,
} from '../labels/libelles/source-de-l-activite.labels'
import type { StatutDeRendezVousDansLURL } from '../labels/libelles/statut-de-rendez-vous.labels'
import {
  type TypeActiviteSlug,
  typeActiviteSlugValues,
} from '../labels/libelles/type-activite.labels'

type ThematiqueDansLURL = (typeof THEMATIQUES_RECHERCHEES)[number]

type UnOuZero = '0' | '1'

export type FiltresDeLaListe = {
  du?: string
  au?: string
  types?: TypeActiviteSlug[]
  rdvs?: StatutDeRendezVousDansLURL[]
  mediateurs?: string[]
  beneficiaires?: string[]
  communes?: string[]
  departements?: string[]
  lieux?: string[]
  conseiller_numerique?: UnOuZero
  demarches_administratives?: UnOuZero
  thematiqueNonAdministratives?: ThematiqueDansLURL[]
  thematiqueAdministratives?: ThematiqueDansLURL[]
  tags?: string[]
  structuresEmployeuses?: string[]
  rdv?: UnOuZero
  source?: SourceDansLURL
}

const STATUTS = z.enum([
  'unknown',
  'past',
  'seen',
  'revoked',
  'excused',
  'noshow',
])
const UN_OU_ZERO = z.enum(['0', '1'])

const liste = <S extends z.ZodType>(
  schema: S,
  valeur: string | undefined,
): z.output<S>[] | undefined =>
  valeur === undefined ? undefined : [...valeursLues(schema, valeur)]

const une = <S extends z.ZodType>(
  schema: S,
  valeur: string | undefined,
): z.output<S> | undefined => liste(schema, valeur)?.at(0)

export const filtresDeLaListe = (
  criteres: CriteresDesActivites,
): FiltresDeLaListe => {
  const parametres = parametresDesActivitesDe(criteres)
  return {
    du: parametres.du,
    au: parametres.au,
    types: liste(z.enum(typeActiviteSlugValues), parametres.types),
    rdvs: liste(STATUTS, parametres.rdvs),
    mediateurs: liste(z.string(), parametres.mediateurs),
    beneficiaires: liste(z.string(), parametres.beneficiaires),
    communes: liste(z.string(), parametres.communes),
    departements: liste(z.string(), parametres.departements),
    lieux: liste(z.string(), parametres.lieux),
    conseiller_numerique: une(UN_OU_ZERO, parametres.conseiller_numerique),
    demarches_administratives: une(
      UN_OU_ZERO,
      parametres.demarches_administratives,
    ),
    thematiqueNonAdministratives: liste(
      z.enum(THEMATIQUES_RECHERCHEES),
      parametres.thematiqueNonAdministratives,
    ),
    thematiqueAdministratives: liste(
      z.enum(THEMATIQUES_RECHERCHEES),
      parametres.thematiqueAdministratives,
    ),
    tags: liste(z.string(), parametres.tags),
    structuresEmployeuses: liste(z.string(), parametres.structuresEmployeuses),
    rdv: une(UN_OU_ZERO, parametres.rdv),
    source: une(z.enum(SOURCES_DANS_L_URL), parametres.source),
  }
}

export type OptionDEmployeuse = {
  readonly id: string
  readonly nom: string
  readonly commune: string | null
}

export type OptionDeTag = {
  readonly id: string
  readonly nom: string
  readonly portee: 'Personnel' | 'Equipe' | 'Departemental' | 'National'
}

export type OptionDeBeneficiaire = {
  readonly label: string
  readonly value: { readonly id: string } | null
}

export type OptionDeMediateur = {
  readonly label: string
  readonly value: { readonly mediateurId?: string | null } | null
}

export type PeriodeCouverte = {
  readonly first: Date | undefined
  readonly last: Date | undefined
}

type Parametres = Readonly<Record<string, string | null>>

export const CLES_CONSERVEES = ['voir-rdvs'] as const

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

const SOURCES_ADMISES: readonly string[] = ['v1', 'v2']

export const plusDeFiltresEnParametres = (valeurs: {
  readonly structuresEmployeuses?: readonly { readonly id: string }[]
  readonly thematiqueNonAdministratives: readonly string[]
  readonly thematiqueAdministratives: readonly string[]
  readonly tags?: string | readonly string[]
  readonly source?: string
}): Parametres => ({
  structuresEmployeuses: listeEnParametre(
    (valeurs.structuresEmployeuses ?? []).map(({ id }) => id),
  ),
  thematiqueNonAdministratives: listeEnParametre(
    valeurs.thematiqueNonAdministratives,
  ),
  thematiqueAdministratives: listeEnParametre(
    valeurs.thematiqueAdministratives,
  ),
  tags: listeEnParametre(
    valeurs.tags === undefined
      ? []
      : typeof valeurs.tags === 'string'
        ? [valeurs.tags]
        : valeurs.tags,
  ),
  source:
    valeurs.source !== undefined && SOURCES_ADMISES.includes(valeurs.source)
      ? valeurs.source
      : null,
})

export const sansPlusDeFiltres = (): Parametres => ({
  structuresEmployeuses: null,
  thematiqueNonAdministratives: null,
  thematiqueAdministratives: null,
  tags: null,
  source: null,
})

export const sansLeFiltre = (
  requete: { get(cle: string): string | null },
  cle: string,
  valeur: string | readonly string[],
): Parametres =>
  typeof valeur === 'string'
    ? cle === 'rdvs' && valeur === 'tous'
      ? { rdvs: null }
      : { [cle]: listeSansLaValeur(requete.get(cle), valeur) }
    : Object.fromEntries(valeur.map((parametre) => [parametre, null]))
