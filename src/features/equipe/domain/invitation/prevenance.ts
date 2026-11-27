import type { CoordinateurDeLEquipe } from '../coordinateur-de-l-equipe'
import type { Courriel } from '../identite/courriel'
import type { ReferenceInvitation } from './reference-invitation'

export type Prevenance = {
  readonly coordinateur: Courriel
  readonly invite: Courriel
  readonly reponse: 'Acceptee' | 'Refusee'
}

export const prevenanceDe = ({
  coordinateur,
  reference,
  reponse,
}: {
  readonly coordinateur: CoordinateurDeLEquipe | null
  readonly reference: ReferenceInvitation
  readonly reponse: Prevenance['reponse']
}): Prevenance | null =>
  coordinateur === null
    ? null
    : { coordinateur: coordinateur.email, invite: reference.email, reponse }
