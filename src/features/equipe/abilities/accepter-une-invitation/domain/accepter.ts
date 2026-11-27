import { failure, type Result, success } from '@/libraries/result'
import {
  type Courriel,
  exigerEnAttente,
  type Invitation,
  type InvitationDejaTraitee,
  type MediateurId,
} from '../../../domain'
import { InscriptionNonValidee, MauvaisDestinataire } from './errors'

export type Accepteur =
  | {
      readonly type: 'InscriptionValidee'
      readonly email: Courriel
      readonly mediateurId: MediateurId
    }
  | { readonly type: 'InscriptionEnCours'; readonly email: Courriel }

export const mediateurQuiAccepte = (
  invitation: Invitation,
  accepteur: Accepteur,
): Result<
  MediateurId,
  MauvaisDestinataire | InscriptionNonValidee | InvitationDejaTraitee
> => {
  if (accepteur.email !== invitation.reference.email)
    return failure(MauvaisDestinataire())
  if (accepteur.type === 'InscriptionEnCours')
    return failure(InscriptionNonValidee())

  const enAttente = exigerEnAttente(invitation)
  return enAttente.success ? success(accepteur.mediateurId) : enAttente
}
