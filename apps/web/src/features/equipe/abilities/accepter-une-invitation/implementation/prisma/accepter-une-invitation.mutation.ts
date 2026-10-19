import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { adhesionSelect, toAdhesion } from '../../../../db/adhesion.transfer'
import { lireLeCoordinateur } from '../../../../db/coordinateur.query'
import { lireUneInvitation } from '../../../../db/invitation.query'
import {
  adhesionActive,
  type InvitationDejaTraitee,
  InvitationIntrouvable,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../../domain'
import { prevenirLeCoordinateur } from '../../../../implementation/email'
import {
  type Accepteur,
  accepter,
  type InscriptionNonValidee,
  type MauvaisDestinataire,
} from '../../domain'

export type EchecDAcceptation =
  | InvitationIntrouvable
  | InvitationDejaTraitee
  | MauvaisDestinataire
  | InscriptionNonValidee

export const accepterUneInvitation = async ({
  reference,
  accepteur,
  auteurId,
  maintenant = new Date(),
}: {
  reference: ReferenceInvitation
  accepteur: Accepteur
  auteurId: UtilisateurId
  maintenant?: Date
}): Promise<Result<void, EchecDAcceptation>> => {
  const lue = await lireUneInvitation(reference)
  if (lue === null) return failure(InvitationIntrouvable())

  const acceptation = accepter(lue.invitation, accepteur)
  if (!acceptation.success) return acceptation

  const { mediateurId } = acceptation.data

  await prismaClient.$transaction(async (transaction) => {
    await transaction.invitationEquipe.update({
      where: lue.cle,
      data: { acceptee: maintenant, mediateurId },
    })

    const adhesions = await transaction.mediateurCoordonne.findMany({
      where: { mediateurId, coordinateurId: reference.coordinateurId },
      select: adhesionSelect,
    })

    if (adhesionActive(adhesions.map(toAdhesion)) === null)
      await transaction.mediateurCoordonne.create({
        data: { mediateurId, coordinateurId: reference.coordinateurId },
      })
  })

  addMutationLog({
    userId: auteurId,
    nom: 'AccepterInvitationMediateurCoordonne',
    duration: 0,
    data: { email: reference.email, coordinateurId: reference.coordinateurId },
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
