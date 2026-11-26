import type { NomAffiche } from '../identite/nom-affiche'
import type { InvitationEnAttente } from './invitation'

export type EnvoiDInvitation = {
  readonly invitation: InvitationEnAttente
  readonly de: NomAffiche
}
