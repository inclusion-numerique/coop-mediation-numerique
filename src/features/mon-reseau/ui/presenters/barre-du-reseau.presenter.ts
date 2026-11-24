import type {
  AdresseCourante,
  EtiquetteAffichee,
} from '@/libraries/etat-d-url/definition/composition'
import type { Libelles } from '@/libraries/etat-d-url/definition/filtre'
import type { SelectOption } from '@/libraries/ui/components/form/utils/options'

const SUGGESTIONS = 10

type Composition<V> = {
  readonly charger: (parametres: AdresseCourante['parametres']) => V
  readonly etiquettes: (
    adresse: AdresseCourante,
    valeurs: V,
    libelles: Libelles,
  ) => readonly EtiquetteAffichee[]
  readonly sansFiltres: (adresse: AdresseCourante) => string
}

export const barreDuReseau = <
  V extends { readonly communes: readonly string[] },
>({
  filtres,
  adresse,
  communes,
}: {
  filtres: Composition<V>
  adresse: AdresseCourante
  communes: readonly SelectOption[]
}) => {
  const valeurs = filtres.charger(adresse.parametres)
  const choisies = communes.filter(({ value }) =>
    valeurs.communes.includes(value),
  )
  return {
    etiquettes: filtres.etiquettes(adresse, valeurs, {
      communes: new Map(choisies.map(({ value, label }) => [value, label])),
    }),
    sansFiltres: filtres.sansFiltres(adresse),
    communes: { suggestions: communes.slice(0, SUGGESTIONS), choisies },
  }
}

export type BarreDuReseau = ReturnType<typeof barreDuReseau>
