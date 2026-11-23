import type { OptionsDeLaBarre } from '../../../../ui/components/filtres/BarreDeFiltres'
import {
  type ActivitesFiltersLabels,
  generateActivitesFiltersLabels,
} from '../../../../ui/labels/filtres/filtres.labels'
import { optionsDesSources } from '../../../../ui/labels/libelles/source-de-l-activite.labels'
import type { FiltresDeLaListe } from '../../../../ui/presenters/filtres/filtres-de-la-liste'

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

export const libellesDuClasseur = (
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

export const requeteDeLExport = (filtres: FiltresDeLaListe): string =>
  new URLSearchParams(
    Object.entries(filtres).flatMap(([cle, valeur]) => {
      const texte = Array.isArray(valeur) ? valeur.join(',') : (valeur ?? '')
      return texte === '' ? [] : [[cle, texte]]
    }),
  ).toString()

export const cheminAvecRequete = (chemin: string, requete: string): string =>
  requete === '' ? chemin : `${chemin}?${requete}`
