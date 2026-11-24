import type { CriteresDesActivites } from '../../../../domain'
import type { OptionsDeLaBarre } from '../../../../ui/components/filtres/BarreDeFiltres'
import {
  type ActivitesFiltersLabels,
  generateActivitesFiltersLabels,
} from '../../../../ui/labels/filtres/filtres.labels'
import { optionsDesSources } from '../../../../ui/labels/libelles/source-de-l-activite.labels'
import {
  type FiltresDeLaListe,
  filtresDeLaListe,
} from '../../../../ui/search-params/filtres-de-la-liste.search-params'
import type { ExportDesAccompagnements } from '../../domain'
import { contenuDuClasseur } from './lignes-du-classeur.presenter'

export const libellesDeLExport = (
  filtres: FiltresDeLaListe,
  options: OptionsDeLaBarre,
): ActivitesFiltersLabels =>
  generateActivitesFiltersLabels(filtres, {
    communesOptions: options.communes,
    departementsOptions: options.departements,
    lieuxActiviteOptions: options.lieux,
    structuresEmployeusesOptions: options.employeuses.map(({ id, nom }) => ({
      id,
      nom,
    })),
    tagsOptions: options.tags.map(({ id, nom }) => ({ id, nom })),
    beneficiairesOptions: [],
    mediateursOptions: [],
    optionsDesSources: options.importsV1 ? [...optionsDesSources] : [],
  })

type NomsDesFiltres = {
  readonly beneficiaires: readonly {
    readonly label: string
    readonly value: { readonly id?: string | null } | null
  }[]
  readonly mediateurs: readonly {
    readonly label: string
    readonly value: { readonly mediateurId: string } | null
  }[]
  readonly employeuses: readonly {
    readonly id: number
    readonly nom: string | null
  }[]
  readonly communes: readonly {
    readonly label: string
    readonly value: string
  }[]
  readonly departements: readonly {
    readonly label: string
    readonly value: string
  }[]
  readonly lieux: readonly { readonly label: string; readonly value: string }[]
  readonly tags: readonly { readonly id: string; readonly nom: string }[]
}

const libellesDuClasseur = (
  filtres: FiltresDeLaListe,
  noms: NomsDesFiltres,
  avecImportsV1: boolean,
): ActivitesFiltersLabels =>
  generateActivitesFiltersLabels(filtres, {
    communesOptions: [...noms.communes],
    departementsOptions: [...noms.departements],
    lieuxActiviteOptions: [...noms.lieux],
    structuresEmployeusesOptions: noms.employeuses.map(({ id, nom }) => ({
      id: String(id),
      nom: nom ?? '',
    })),
    tagsOptions: noms.tags.map(({ id, nom }) => ({ id, nom })),
    beneficiairesOptions: noms.beneficiaires.map(({ label, value }) => ({
      label,
      value: value?.id ? { id: value.id } : null,
    })),
    mediateursOptions: [...noms.mediateurs],
    optionsDesSources: avecImportsV1 ? [...optionsDesSources] : [],
  })

export const classeurPresente = ({
  criteres,
  noms,
  exportDes,
  fuseau,
}: {
  readonly criteres: CriteresDesActivites
  readonly noms: NomsDesFiltres
  readonly exportDes: ExportDesAccompagnements
  readonly fuseau: string
}) => ({
  filtres: libellesDuClasseur(
    filtresDeLaListe(criteres),
    noms,
    exportDes.colonnes.source,
  ),
  ...contenuDuClasseur(exportDes, fuseau),
})

export const cheminDImpressionDesStatistiques = (requete: string) =>
  `/coop/mes-statistiques?print=true${requete === '' ? '' : (`&${requete}` as const)}` as const
