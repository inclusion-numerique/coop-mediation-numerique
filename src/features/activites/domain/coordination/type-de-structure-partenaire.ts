import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

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
    ])
    .brand('TypeDeStructurePartenaire'),
)

export type TypeDeStructurePartenaire = Model.TypeOf<
  typeof TypeDeStructurePartenaire
>
