import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

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
