import { z } from 'zod'
import { CodePostal } from '@/libraries/code-postal'
import { CodeInsee } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'
import { NomDeCommune } from './nom-de-commune'

export const Commune = defineModel(
  z
    .object({
      nom: NomDeCommune.schema,
      codePostal: CodePostal.schema,
      codeInsee: CodeInsee.schema,
    })
    .readonly()
    .brand('Commune'),
)

export type Commune = Model.TypeOf<typeof Commune>
