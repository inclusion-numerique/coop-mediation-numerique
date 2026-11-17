import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { lireUneInvitation } from '../../../../db/invitation.query'
import {
  ActionNonAutorisee,
  exigerEnAttente,
  type Gestionnaire,
  type InvitationDejaTraitee,
  InvitationIntrouvable,
  peutGererLEquipe,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../../domain'

export type EchecDAnnulation =
  | ActionNonAutorisee
  | InvitationIntrouvable
  | InvitationDejaTraitee

export const annulerUneInvitation = async ({
  reference,
  gestionnaire,
  auteurId,
}: {
  reference: ReferenceInvitation
  gestionnaire: Gestionnaire
  auteurId: UtilisateurId
}): Promise<Result<void, EchecDAnnulation>> => {
  if (!peutGererLEquipe(gestionnaire)(reference.coordinateurId))
    return failure(ActionNonAutorisee())

  const lue = await lireUneInvitation(reference)
  if (lue === null) return failure(InvitationIntrouvable())

  const enAttente = exigerEnAttente(lue.invitation)
  if (!enAttente.success) return enAttente

  await prismaClient.invitationEquipe.delete({
    where: lue.cle,
  })

  addMutationLog({
    userId: auteurId,
    nom: 'AnnulerInvitationMediateurCoordonne',
    duration: 0,
    data: { email: reference.email, coordinateurId: reference.coordinateurId },
  })

  return success(undefined)
}
