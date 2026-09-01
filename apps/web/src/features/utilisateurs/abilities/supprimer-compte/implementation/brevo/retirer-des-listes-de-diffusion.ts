import { removeBrevoUserContact } from '@app/web/external-apis/brevo/removeBrevoUserContact'
import type { RetirerDesListesDeDiffusion } from '../../domain'

/**
 * Adaptateur du port vers Brevo.
 *
 * Le port énonce une intention métier — sortir quelqu'un de nos listes de
 * diffusion — et ne doit pas nommer le prestataire ; l'enrobage de l'API, lui,
 * ne peut pas prétendre le contraire. Traduire l'un dans l'autre est le travail
 * d'un adaptateur, et c'est ici qu'il se fait : une fois, plutôt qu'à chacun des
 * sites qui composent l'effacement.
 */
export const retirerDesListesDeDiffusion: RetirerDesListesDeDiffusion =
  removeBrevoUserContact
