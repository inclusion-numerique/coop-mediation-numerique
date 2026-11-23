import { removeBrevoUserContact } from '@/features/utilisateurs/implementation/brevo/removeBrevoUserContact'
import type { RetirerDesListesDeDiffusion } from '../../domain'

export const retirerDesListesDeDiffusion: RetirerDesListesDeDiffusion =
  removeBrevoUserContact
