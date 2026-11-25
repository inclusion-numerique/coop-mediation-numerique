import type { Courriel } from '../identite/courriel'
import type { NomAffiche } from '../identite/nom-affiche'
import type { InvitationEnAttente } from './invitation'

export type EnvoyerUneInvitation = (envoi: {
  readonly invitation: InvitationEnAttente
  readonly de: NomAffiche
}) => Promise<void>

export type PrevenirLeCoordinateur = (prevenance: {
  readonly coordinateur: string
  readonly invite: Courriel
  readonly reponse: 'Acceptee' | 'Refusee'
}) => Promise<void>
