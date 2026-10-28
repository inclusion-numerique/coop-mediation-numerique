import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TypeDeStructurePartenaire = defineModel(
  z
    .enum([
      'Commune',
      'Epci',
      'Departement',
      'Region',
      'Association',
      'Entreprise',
      'Hub',
      'Etat',
      'Groupement',
      'Autre',
    ])
    .brand('TypeDeStructurePartenaire'),
)

export type TypeDeStructurePartenaire = Model.TypeOf<
  typeof TypeDeStructurePartenaire
>
