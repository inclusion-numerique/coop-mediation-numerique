import { valeursLues } from '@app/web/libraries/parametres-d-url'
import { z } from 'zod'
import {
  type CriteresDesActivites,
  parametresDesActivitesDe,
  THEMATIQUES_RECHERCHEES,
} from '../../domain'
import {
  SOURCES_DANS_L_URL,
  type SourceDansLURL,
} from '../libelles/source-de-l-activite'
import type { StatutDeRendezVousDansLURL } from '../libelles/statut-de-rendez-vous'
import {
  type TypeActiviteSlug,
  typeActiviteSlugValues,
} from '../libelles/type-activite'

export type ThematiqueDansLURL = (typeof THEMATIQUES_RECHERCHEES)[number]

export type UnOuZero = '0' | '1'

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
