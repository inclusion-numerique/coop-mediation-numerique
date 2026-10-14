import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { lireLeCoordinateur } from '../../../../db/coordinateur.query'
import {
  cleDeLInvitation,
  lireUneInvitation,
} from '../../../../db/invitation.query'
import {
  exigerEnAttente,
  type InvitationDejaTraitee,
  InvitationIntrouvable,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../../domain'
import { prevenirLeCoordinateur } from '../../../../implementation/email'

export type EchecDeRefus = InvitationIntrouvable | InvitationDejaTraitee

export const refuserUneInvitation = async ({
  reference,
  auteurId,
  maintenant = new Date(),
}: {
  reference: ReferenceInvitation
  auteurId: UtilisateurId | null
  maintenant?: Date
}): Promise<Result<void, EchecDeRefus>> => {
  const invitation = await lireUneInvitation(reference)
  if (invitation === null) return failure(InvitationIntrouvable())

  const enAttente = exigerEnAttente(invitation)
  if (!enAttente.success) return enAttente

  await prismaClient.invitationEquipe.update({
    where: cleDeLInvitation(reference),
    data: { refusee: maintenant },
  })

  addMutationLog({
    userId: auteurId,
    nom: 'RefuserInvitationMediateurCoordonne',
    duration: 0,
    data: { email: reference.email, coordinateurId: reference.coordinateurId },
  })

  const coordinateur = await lireLeCoordinateur(reference.coordinateurId)
  if (coordinateur !== null)
    await prevenirLeCoordinateur({
      coordinateur: coordinateur.email,
      invite: reference.email,
      reponse: 'Refusee',
    })

  return success(undefined)
}
