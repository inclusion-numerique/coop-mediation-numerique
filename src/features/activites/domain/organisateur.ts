import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Organisateur = defineModel(
  z
    .enum([
      'MaStructure',
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
    .brand('Organisateur'),
)

export type Organisateur = Model.TypeOf<typeof Organisateur>
