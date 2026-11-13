import { CodeDepartement, CodeInsee } from '@app/web/libraries/insee'
import {
  type Periode,
  periodeLue,
  premiereValeur,
  type ValeurDeParametre,
  valeurLue,
  valeursLues,
} from '@app/web/libraries/parametres-d-url'
import { z } from 'zod'
import { BeneficiaireId } from './beneficiaire-id'
import { EmployeuseId } from './employeuse-id'
import { FILTRES_D_ORIGINE, FiltreDOrigine } from './filtre-d-origine'
import { FILTRES_DE_DEMARCHE, FiltreDeDemarche } from './filtre-de-demarche'
import {
  FILTRES_DE_DISPOSITIF,
  FiltreDeDispositif,
} from './filtre-de-dispositif'
import { LieuActiviteId } from './lieu-activite-id'
import { MediateurId } from './mediateur-id'
import {
  SOURCES_DE_L_ACTIVITE,
  SourceDeLActivite,
} from './source-de-l-activite'
import {
  STATUTS_DE_RENDEZ_VOUS,
  StatutDeRendezVous,
} from './statut-de-rendez-vous'
import { TagId } from './tag-id'
import {
  estAdministrative,
  ThematiqueRecherchee,
} from './thematique-recherchee'
import { TYPES_D_ACTIVITE, TypeDActivite } from './type-d-activite'

export type CriteresDesActivites = {
  readonly periode: Periode | null
  readonly types: readonly TypeDActivite[]
  readonly statutsDeRendezVous: readonly StatutDeRendezVous[]
  readonly mediateurs: readonly MediateurId[]
  readonly beneficiaires: readonly BeneficiaireId[]
  readonly communes: readonly CodeInsee[]
  readonly departements: readonly CodeDepartement[]
  readonly lieux: readonly LieuActiviteId[]
  readonly thematiques: readonly ThematiqueRecherchee[]
  readonly demarche: FiltreDeDemarche | null
  readonly tags: readonly TagId[]
  readonly employeuses: readonly EmployeuseId[]
  readonly dispositif: FiltreDeDispositif | null
  readonly origine: FiltreDOrigine | null
  readonly source: SourceDeLActivite | null
}

export type ParametresDesActivites = {
  readonly du?: ValeurDeParametre
  readonly au?: ValeurDeParametre
  readonly types?: ValeurDeParametre
  readonly rdvs?: ValeurDeParametre
  readonly mediateurs?: ValeurDeParametre
  readonly beneficiaires?: ValeurDeParametre
  readonly communes?: ValeurDeParametre
  readonly departements?: ValeurDeParametre
  readonly lieux?: ValeurDeParametre
  readonly conseiller_numerique?: ValeurDeParametre
  readonly demarches_administratives?: ValeurDeParametre
  readonly thematiqueNonAdministratives?: ValeurDeParametre
  readonly thematiqueAdministratives?: ValeurDeParametre
  readonly tags?: ValeurDeParametre
  readonly structuresEmployeuses?: ValeurDeParametre
  readonly rdv?: ValeurDeParametre
  readonly source?: ValeurDeParametre
}

const TYPE_DANS_L_URL: Readonly<
  Record<(typeof TYPES_D_ACTIVITE)[number], string>
> = {
  Individuel: 'individuel',
  Collectif: 'collectif',
}

const STATUT_DANS_L_URL: Readonly<
  Record<(typeof STATUTS_DE_RENDEZ_VOUS)[number], string>
> = {
  AVenir: 'unknown',
  Passe: 'past',
  Honore: 'seen',
  Annule: 'revoked',
  AnnuleParLeBeneficiaire: 'excused',
  Absent: 'noshow',
}

const DEMARCHE_DANS_L_URL: Readonly<
  Record<(typeof FILTRES_DE_DEMARCHE)[number], string>
> = { Avec: '1', Sans: '0' }

const DISPOSITIF_DANS_L_URL: Readonly<
  Record<(typeof FILTRES_DE_DISPOSITIF)[number], string>
> = { ConseillersNumeriques: '1', HorsDispositif: '0' }

const ORIGINE_DANS_L_URL: Readonly<
  Record<(typeof FILTRES_D_ORIGINE)[number], string>
> = { RendezVous: '1', HorsRendezVous: '0' }

const SOURCE_DANS_L_URL: Readonly<
  Record<(typeof SOURCES_DE_L_ACTIVITE)[number], string>
> = { ImportV1: 'v1', Coop: 'v2' }

const traduite =
  <S extends z.ZodType>(table: Readonly<Record<string, string>>, schema: S) =>
  (valeurDansLURL: string): z.output<S> | null =>
    valeurLue(
      schema,
      Object.entries(table)
        .find(([, dansLURL]) => dansLURL === valeurDansLURL)
        ?.at(0),
    )

const traduites = <S extends z.ZodType>(
  table: Readonly<Record<string, string>>,
  schema: S,
  valeur: ValeurDeParametre,
): readonly z.output<S>[] =>
  valeursLues(z.string(), valeur).flatMap((element) => {
    const lue = traduite(table, schema)(element)
    return lue === null ? [] : [lue]
  })

const uneTraduite = <S extends z.ZodType>(
  table: Readonly<Record<string, string>>,
  schema: S,
  valeur: ValeurDeParametre,
): z.output<S> | null => traduite(table, schema)(premiereValeur(valeur) ?? '')

const dansLURL =
  <K extends string>(table: Readonly<Record<K, string>>) =>
  (cle: K): string =>
    table[cle]

const EmployeuseDansLURL = z.coerce.number().pipe(EmployeuseId.schema)

export const criteresDesActivites = (
  parametres: ParametresDesActivites,
): CriteresDesActivites => ({
  periode: periodeLue(parametres.du, parametres.au),
  types: traduites(TYPE_DANS_L_URL, TypeDActivite.schema, parametres.types),
  statutsDeRendezVous: traduites(
    STATUT_DANS_L_URL,
    StatutDeRendezVous.schema,
    parametres.rdvs,
  ),
  mediateurs: valeursLues(MediateurId.schema, parametres.mediateurs),
  beneficiaires: valeursLues(BeneficiaireId.schema, parametres.beneficiaires),
  communes: valeursLues(CodeInsee.schema, parametres.communes),
  departements: valeursLues(CodeDepartement.schema, parametres.departements),
  lieux: valeursLues(LieuActiviteId.schema, parametres.lieux),
  thematiques: valeursLues(ThematiqueRecherchee.schema, [
    ...valeursLues(z.string(), parametres.thematiqueNonAdministratives),
    ...valeursLues(z.string(), parametres.thematiqueAdministratives),
  ]),
  demarche: uneTraduite(
    DEMARCHE_DANS_L_URL,
    FiltreDeDemarche.schema,
    parametres.demarches_administratives,
  ),
  tags: valeursLues(TagId.schema, parametres.tags),
  employeuses: valeursLues(
    EmployeuseDansLURL,
    parametres.structuresEmployeuses,
  ),
  dispositif: uneTraduite(
    DISPOSITIF_DANS_L_URL,
    FiltreDeDispositif.schema,
    parametres.conseiller_numerique,
  ),
  origine: uneTraduite(
    ORIGINE_DANS_L_URL,
    FiltreDOrigine.schema,
    parametres.rdv,
  ),
  source: uneTraduite(
    SOURCE_DANS_L_URL,
    SourceDeLActivite.schema,
    parametres.source,
  ),
})

const jour = (date: Date): string => date.toISOString().slice(0, 10)

const liste = (valeurs: readonly (string | number)[]): string | undefined =>
  valeurs.length === 0 ? undefined : valeurs.join(',')

export const parametresDe = (
  criteres: CriteresDesActivites,
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    Object.entries({
      du: criteres.periode === null ? undefined : jour(criteres.periode.du),
      au: criteres.periode === null ? undefined : jour(criteres.periode.au),
      types: liste(criteres.types.map(dansLURL(TYPE_DANS_L_URL))),
      rdvs: liste(
        criteres.statutsDeRendezVous.map(dansLURL(STATUT_DANS_L_URL)),
      ),
      mediateurs: liste(criteres.mediateurs),
      beneficiaires: liste(criteres.beneficiaires),
      communes: liste(criteres.communes),
      departements: liste(criteres.departements),
      lieux: liste(criteres.lieux),
      conseiller_numerique:
        criteres.dispositif === null
          ? undefined
          : dansLURL(DISPOSITIF_DANS_L_URL)(criteres.dispositif),
      demarches_administratives:
        criteres.demarche === null
          ? undefined
          : dansLURL(DEMARCHE_DANS_L_URL)(criteres.demarche),
      thematiqueNonAdministratives: liste(
        criteres.thematiques.filter(
          (thematique) => !estAdministrative(thematique),
        ),
      ),
      thematiqueAdministratives: liste(
        criteres.thematiques.filter(estAdministrative),
      ),
      tags: liste(criteres.tags),
      structuresEmployeuses: liste(criteres.employeuses),
      rdv:
        criteres.origine === null
          ? undefined
          : dansLURL(ORIGINE_DANS_L_URL)(criteres.origine),
      source:
        criteres.source === null
          ? undefined
          : dansLURL(SOURCE_DANS_L_URL)(criteres.source),
    }).flatMap(([cle, valeur]) =>
      valeur === undefined ? [] : [[cle, valeur]],
    ),
  )

export const estFiltre = (criteres: CriteresDesActivites): boolean =>
  Object.keys(parametresDe(criteres)).length > 0
