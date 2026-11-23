import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import { CoordinateurId } from '../identifiants/coordinateur-id'
import { Email } from '../identite/courriel'

export const ReferenceInvitation = defineModel(
  z
    .object({
      email: Email.schema,
      coordinateurId: CoordinateurId.schema,
    })
    .brand('ReferenceInvitation'),
)

export type ReferenceInvitation = Model.TypeOf<typeof ReferenceInvitation>
