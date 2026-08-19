import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Code d'autorisation à usage unique remis par RDV Service Public au retour du
 * parcours OAuth, à échanger contre des jetons.
 */
export const CodeAutorisation = defineModel(
  z.string().trim().min(1).brand('CodeAutorisation'),
)

export type CodeAutorisation = Model.TypeOf<typeof CodeAutorisation>
