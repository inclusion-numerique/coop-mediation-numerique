import { CodePostal } from '@app/web/libraries/code-postal'
import { CodeInsee } from '@app/web/libraries/insee'
import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
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
