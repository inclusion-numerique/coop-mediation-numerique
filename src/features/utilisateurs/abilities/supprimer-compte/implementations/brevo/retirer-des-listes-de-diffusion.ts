import { removeBrevoUserContact } from '@/features/utilisateurs/implementations/brevo/removeBrevoUserContact'
import type { RetirerDesListesDeDiffusion } from '../../domain'

export const retirerDesListesDeDiffusion: RetirerDesListesDeDiffusion =
  removeBrevoUserContact
