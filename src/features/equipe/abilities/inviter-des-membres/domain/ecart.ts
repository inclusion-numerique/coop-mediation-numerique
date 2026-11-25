import type { Courriel } from '../../../domain'
import type { RaisonDEcart } from './raison-d-ecart'

export type Ecart = {
  readonly email: Courriel
  readonly raison: RaisonDEcart
}
