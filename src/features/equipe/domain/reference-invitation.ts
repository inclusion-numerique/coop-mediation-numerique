import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { CoordinateurId } from './coordinateur-id'
import { Email } from './email'

export const ReferenceInvitation = defineModel(
  z
    .object({
      email: Email.schema,
      coordinateurId: CoordinateurId.schema,
    })
    .brand('ReferenceInvitation'),
)

export type ReferenceInvitation = Model.TypeOf<typeof ReferenceInvitation>
