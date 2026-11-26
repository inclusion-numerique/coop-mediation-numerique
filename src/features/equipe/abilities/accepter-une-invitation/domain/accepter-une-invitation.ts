import { failure, type Result, success } from '@/libraries/result'
import {
  type InvitationDejaTraitee,
  InvitationIntrouvable,
  type LireLeCoordinateur,
  type LireUneInvitation,
  type MediateurId,
  type PrevenirLeCoordinateur,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../domain'
import { type Accepteur, accepter } from './accepter'
import type { InscriptionNonValidee, MauvaisDestinataire } from './errors'

export type EchecDAcceptation =
  | InvitationIntrouvable
  | InvitationDejaTraitee
  | MauvaisDestinataire
  | InscriptionNonValidee

export type EnregistrerLAcceptation<Cle> = (acceptation: {
  readonly cle: Cle
  readonly reference: ReferenceInvitation
  readonly mediateurId: MediateurId
  readonly auteurId: UtilisateurId
  readonly maintenant: Date
}) => Promise<void>

export const accepterUneInvitation =
  <Cle>({
    lireUneInvitation,
    enregistrerLAcceptation,
    lireLeCoordinateur,
    prevenirLeCoordinateur,
  }: {
    readonly lireUneInvitation: LireUneInvitation<Cle>
    readonly enregistrerLAcceptation: EnregistrerLAcceptation<Cle>
    readonly lireLeCoordinateur: LireLeCoordinateur
    readonly prevenirLeCoordinateur: PrevenirLeCoordinateur
  }) =>
  async ({
    reference,
    accepteur,
    auteurId,
    maintenant,
  }: {
    readonly reference: ReferenceInvitation
    readonly accepteur: Accepteur
    readonly auteurId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<void, EchecDAcceptation>> => {
    const lue = await lireUneInvitation(reference)
    if (lue === null) return failure(InvitationIntrouvable())

    const acceptation = accepter(lue.invitation, accepteur)
    if (!acceptation.success) return acceptation

    await enregistrerLAcceptation({
      cle: lue.cle,
      reference,
      mediateurId: acceptation.data.mediateurId,
      auteurId,
      maintenant,
    })

    const coordinateur = await lireLeCoordinateur(reference.coordinateurId)
    if (coordinateur !== null)
      await prevenirLeCoordinateur({
        coordinateur: coordinateur.email,
        invite: reference.email,
        reponse: 'Acceptee',
      })

    return success(undefined)
  }
