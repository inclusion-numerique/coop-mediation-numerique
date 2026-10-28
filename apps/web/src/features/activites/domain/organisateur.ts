import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

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
