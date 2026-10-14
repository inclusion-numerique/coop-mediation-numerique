import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const EmailInvitation = defineModel(
  z.string().trim().toLowerCase().pipe(z.email()).brand('EmailInvitation'),
)

export type EmailInvitation = Model.TypeOf<typeof EmailInvitation>
