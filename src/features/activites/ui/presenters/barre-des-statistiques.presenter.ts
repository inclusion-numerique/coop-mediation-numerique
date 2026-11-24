import type { AdresseCourante } from '@/libraries/filtres/definition/composition'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
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

export const barreDesStatistiques = ({
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
