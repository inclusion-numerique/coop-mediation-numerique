import { addMutationLog, prismaClient } from '@/configuration/prisma'
import { failure, type Result, success } from '@/libraries/result'
import {
  adhesionActive,
  type InvitationDejaTraitee,
  InvitationIntrouvable,
  type PrevenirLeCoordinateur,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../../domain'
import {
  adhesionSelect,
  toAdhesion,
} from '../../../../implementations/prisma/adhesion.transfer'
import { lireLeCoordinateur } from '../../../../implementations/prisma/coordinateur.query'
import { lireUneInvitation } from '../../../../implementations/prisma/invitation.query'
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

export const accepterUneInvitation =
  ({
    prevenirLeCoordinateur,
  }: {
    prevenirLeCoordinateur: PrevenirLeCoordinateur
  }) =>
  async ({
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
        reponse: 'Acceptee',
      })

    return success(undefined)
  }
