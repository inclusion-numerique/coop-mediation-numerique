import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const EchelonTerritorial = defineModel(
  z
    .enum([
      'Communal',
      'Intercommunal',
      'Departemental',
      'Regional',
      'National',
    ])
    .brand('EchelonTerritorial'),
)

export type EchelonTerritorial = Model.TypeOf<typeof EchelonTerritorial>
