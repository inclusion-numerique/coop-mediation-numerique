import type { AdresseCourante } from '@/libraries/etat-d-url'
import type { SelectOption } from '@/libraries/ui'
import {
  filtresDesCoordinations,
  type ValeursDesCoordinations,
} from '../../../../ui/filtres/coordinations.filtre'
import type { OptionsDeFiltrePresentees } from './options-de-filtre.presenter'

type Nomme = { readonly id: string; readonly nom: string }

export const barreDesCoordinations = ({
  adresse,
  valeurs,
  options,
  tagsChoisis,
}: {
  adresse: AdresseCourante
  valeurs: ValeursDesCoordinations
  options: OptionsDeFiltrePresentees
  tagsChoisis: readonly Nomme[]
}) => {
  const choisies: readonly SelectOption[] = tagsChoisis.map(({ id, nom }) => ({
    value: id,
    label: nom,
  }))
  const etiquettes = filtresDesCoordinations.etiquettes(adresse, valeurs, {
    tags: new Map(choisies.map(({ value, label }) => [value, label])),
  })

  return {
    etiquettes,
    sansFiltres: filtresDesCoordinations.sansFiltres(adresse),
    export: {
      libelles: etiquettes.map(({ libelle }) => libelle),
      requete: filtresDesCoordinations.requete(valeurs),
    },
    periode: { debut: options.debut, fin: options.fin },
    tags: {
      suggestions: options.tags.map(({ value, label }) => ({ value, label })),
      choisies,
    },
  }
}

export type BarreDesCoordinationsPresentee = ReturnType<
  typeof barreDesCoordinations
>
