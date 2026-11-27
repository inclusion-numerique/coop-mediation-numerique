import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const ProfilDInscription = defineModel(
  z
    .enum([
      'ConseillerNumerique',
      'CoordinateurConseillerNumerique',
      'Mediateur',
      'Coordinateur',
    ])
    .brand('ProfilDInscription'),
)

export type ProfilDInscription = Model.TypeOf<typeof ProfilDInscription>
