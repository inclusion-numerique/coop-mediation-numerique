import { removeBrevoUserContact } from '@/features/utilisateurs/implementations/brevo/remove-brevo-user-contact'
import type { RetirerDesListesDeDiffusion } from '../../domain'

export const retirerDesListesDeDiffusion: RetirerDesListesDeDiffusion =
  removeBrevoUserContact
