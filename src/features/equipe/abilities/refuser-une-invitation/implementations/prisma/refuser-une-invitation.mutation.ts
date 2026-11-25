import { addMutationLog, prismaClient } from '@/configuration/prisma'
import { failure, type Result, success } from '@/libraries/result'
import {
  exigerEnAttente,
  type InvitationDejaTraitee,
  InvitationIntrouvable,
  type PrevenirLeCoordinateur,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../../domain'
import { lireLeCoordinateur } from '../../../../implementations/prisma/coordinateur.query'
import { lireUneInvitation } from '../../../../implementations/prisma/invitation.query'

export type EchecDeRefus = InvitationIntrouvable | InvitationDejaTraitee

export const refuserUneInvitation =
  ({
    prevenirLeCoordinateur,
  }: {
    prevenirLeCoordinateur: PrevenirLeCoordinateur
  }) =>
  async ({
    reference,
    auteurId,
    maintenant = new Date(),
  }: {
    reference: ReferenceInvitation
    auteurId: UtilisateurId | null
    maintenant?: Date
  }): Promise<Result<void, EchecDeRefus>> => {
    const lue = await lireUneInvitation(reference)
    if (lue === null) return failure(InvitationIntrouvable())

    const enAttente = exigerEnAttente(lue.invitation)
    if (!enAttente.success) return enAttente

    await prismaClient.invitationEquipe.update({
      where: lue.cle,
      data: { refusee: maintenant },
    })

    addMutationLog({
      userId: auteurId,
      nom: 'RefuserInvitationMediateurCoordonne',
      data: {
        email: reference.email,
        coordinateurId: reference.coordinateurId,
      },
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
