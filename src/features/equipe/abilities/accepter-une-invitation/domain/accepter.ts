import { failure, type Result, success } from '@app/web/libraries/result'
import {
  type Email,
  exigerEnAttente,
  type Invitation,
  type InvitationDejaTraitee,
  type InvitationEnAttente,
  type MediateurId,
} from '../../../domain'
import { InscriptionNonValidee, MauvaisDestinataire } from './errors'

export type Accepteur =
  | {
      readonly type: 'InscriptionValidee'
      readonly email: Email
      readonly mediateurId: MediateurId
    }
  | { readonly type: 'InscriptionEnCours'; readonly email: Email }

export type Acceptation = {
  readonly invitation: InvitationEnAttente
  readonly mediateurId: MediateurId
}

export const accepter = (
  invitation: Invitation,
  accepteur: Accepteur,
): Result<
  Acceptation,
  MauvaisDestinataire | InscriptionNonValidee | InvitationDejaTraitee
> => {
  if (accepteur.email !== invitation.reference.email)
    return failure(MauvaisDestinataire())
  if (accepteur.type === 'InscriptionEnCours')
    return failure(InscriptionNonValidee())

  const enAttente = exigerEnAttente(invitation)
  return enAttente.success
    ? success({
        invitation: enAttente.data,
        mediateurId: accepteur.mediateurId,
      })
    : enAttente
}
