import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const PREFIXE_DU_LIEN_D_INVITATION = '/invitations/'

export const LienInvitation = defineModel(
  z.string().startsWith(PREFIXE_DU_LIEN_D_INVITATION).brand('LienInvitation'),
)

export type LienInvitation = Model.TypeOf<typeof LienInvitation>
