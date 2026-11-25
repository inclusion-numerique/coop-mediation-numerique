import type { AdresseCourante } from '@/libraries/etat-d-url'
import type { SelectOption } from '@/libraries/ui'
import {
  filtresDeMesActivites,
  type ValeursDeMesActivites,
} from '../filtres/filtres-de-mes-activites.filtre'

type OptionsDesLieux = {
  readonly lieux: readonly SelectOption[]
  readonly communes: readonly SelectOption[]
  readonly departements: readonly SelectOption[]
}

type LieuxDuFiltre = {
  readonly suggestions: OptionsDesLieux
  readonly choisies: OptionsDesLieux
}

type OptionsDeLaBarre = {
  readonly periodeCouverte: { readonly first?: Date; readonly last?: Date }
  readonly importsV1: boolean
  readonly employeuses: readonly {
    readonly id: string
    readonly nom: string
    readonly commune: string | null
  }[]
  readonly tags: readonly { readonly id: string; readonly nom: string }[]
}

type Nomme = { readonly id: string; readonly nom: string }

const enOption = ({ id, nom }: Nomme): SelectOption => ({
  value: id,
  label: nom,
})

const libelles = (options: readonly SelectOption[]) =>
  new Map(options.map(({ value, label }) => [value, label]))

export const barreDeMesActivites = ({
  adresse,
  valeurs,
  options,
  lieux,
  tagsChoisis,
}: {
  adresse: AdresseCourante
  valeurs: ValeursDeMesActivites
  options: OptionsDeLaBarre
  lieux: LieuxDuFiltre
  tagsChoisis: readonly Nomme[]
}) => {
  const employeuses = options.employeuses.map(({ id, nom, commune }) => ({
    value: id,
    label: commune === null ? nom : `${nom} · ${commune}`,
  }))
  const choisies = new Set(valeurs.structuresEmployeuses.map(String))
  const tags = {
    suggestions: options.tags.map(enOption),
    choisies: tagsChoisis.map(enOption),
  }
  const etiquettes = filtresDeMesActivites.etiquettes(adresse, valeurs, {
    lieux: libelles(lieux.choisies.lieux),
    communes: libelles(lieux.choisies.communes),
    departements: libelles(lieux.choisies.departements),
    tags: libelles(tags.choisies),
    structuresEmployeuses: libelles(employeuses),
  })

  return {
    etiquettes,
    sansFiltres: filtresDeMesActivites.sansFiltres(adresse),
    export: {
      libelles: etiquettes.map(({ libelle }) => libelle),
      requete: filtresDeMesActivites.requete(valeurs),
    },
    periode: {
      debut: options.periodeCouverte.first,
      fin: options.periodeCouverte.last,
    },
    lieux,
    importsV1: options.importsV1,
    employeuses: {
      suggestions: employeuses,
      choisies: employeuses.filter(({ value }) => choisies.has(value)),
    },
    tags,
  }
}

export type BarreDeMesActivitesPresentee = ReturnType<
  typeof barreDeMesActivites
>
