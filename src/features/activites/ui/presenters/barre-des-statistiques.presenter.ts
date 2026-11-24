import type { AdresseCourante } from '@/libraries/etat-d-url/definition/composition'
import type { SelectOption } from '@/libraries/ui/components/form/utils/options'
import {
  filtresDesStatistiques,
  type ValeursDesStatistiques,
} from '../filtres/statistiques.filtre'

type Recherche = {
  readonly suggestions: readonly SelectOption[]
  readonly choisies: readonly SelectOption[]
}

type Lieux = {
  readonly suggestions: {
    readonly lieux: readonly SelectOption[]
    readonly communes: readonly SelectOption[]
    readonly departements: readonly SelectOption[]
  }
  readonly choisies: {
    readonly lieux: readonly SelectOption[]
    readonly communes: readonly SelectOption[]
    readonly departements: readonly SelectOption[]
  }
}

const libelles = (options: readonly SelectOption[]) =>
  new Map(options.map(({ value, label }) => [value, label]))

const barreDesStatistiques = ({
  adresse,
  valeurs,
  lieux,
  employeuses,
  tags,
  mediateurs,
}: {
  adresse: AdresseCourante
  valeurs: ValeursDesStatistiques
  lieux: Lieux
  employeuses: Recherche
  tags: Recherche
  mediateurs: Recherche
}) => {
  const etiquettes = filtresDesStatistiques.etiquettes(adresse, valeurs, {
    lieux: libelles(lieux.choisies.lieux),
    communes: libelles(lieux.choisies.communes),
    departements: libelles(lieux.choisies.departements),
    tags: libelles(tags.choisies),
    structuresEmployeuses: libelles(employeuses.choisies),
    mediateurs: libelles(mediateurs.choisies),
  })

  return {
    etiquettes,
    sansFiltres: filtresDesStatistiques.sansFiltres(adresse),
    filtres: {
      libelles: etiquettes.map(({ libelle }) => libelle),
      requete: filtresDesStatistiques.requete(valeurs),
    },
    lieux,
    employeuses,
    tags,
    mediateurs,
  }
}

export type BarreDesStatistiquesPresentee = ReturnType<
  typeof barreDesStatistiques
>

type Nomme = { readonly id: string; readonly nom: string }

const enOption = ({ id, nom }: Nomme): SelectOption => ({
  value: id,
  label: nom,
})

const parmi = (
  options: readonly SelectOption[],
  valeurs: readonly unknown[],
): readonly SelectOption[] => {
  const choisies = new Set(valeurs.map(String))
  return options.filter(({ value }) => choisies.has(value))
}

export type LecturesDeLaBarreDesStatistiques = {
  readonly lieux: (choisis: {
    readonly lieux: ValeursDesStatistiques['lieux']
    readonly communes: ValeursDesStatistiques['communes']
    readonly departements: ValeursDesStatistiques['departements']
  }) => Promise<Lieux>
  readonly tagsSuggeres: () => Promise<readonly Nomme[]>
  readonly tagsChoisis: (
    ids: ValeursDesStatistiques['tags'],
  ) => Promise<readonly Nomme[]>
  readonly employeuses: () => Promise<readonly SelectOption[]>
  readonly mediateurs: () => Promise<readonly SelectOption[]>
}

const SUGGESTIONS = 10

export const barreDesStatistiquesAvec =
  (lectures: LecturesDeLaBarreDesStatistiques) =>
  async (adresse: AdresseCourante, valeurs: ValeursDesStatistiques) => {
    const [lieux, tagsSuggeres, tagsChoisis, employeuses, mediateurs] =
      await Promise.all([
        lectures.lieux({
          lieux: valeurs.lieux,
          communes: valeurs.communes,
          departements: valeurs.departements,
        }),
        lectures.tagsSuggeres(),
        lectures.tagsChoisis(valeurs.tags),
        lectures.employeuses(),
        lectures.mediateurs(),
      ])
    return barreDesStatistiques({
      adresse,
      valeurs,
      lieux,
      employeuses: {
        suggestions: employeuses.slice(0, SUGGESTIONS),
        choisies: parmi(employeuses, valeurs.structuresEmployeuses),
      },
      tags: {
        suggestions: tagsSuggeres.slice(0, SUGGESTIONS).map(enOption),
        choisies: tagsChoisis.map(enOption),
      },
      mediateurs: {
        suggestions: mediateurs.slice(0, SUGGESTIONS),
        choisies: parmi(mediateurs, valeurs.mediateurs),
      },
    })
  }
