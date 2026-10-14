import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { lireLeCoordinateur } from '../../../../db/coordinateur.query'
import {
  cleDeLInvitation,
  lireUneInvitation,
} from '../../../../db/invitation.query'
import {
  ActionNonAutorisee,
  CoordinateurIntrouvable,
  EnvoiEchoue,
  exigerEnAttente,
  type Gestionnaire,
  type InvitationDejaTraitee,
  InvitationIntrouvable,
  lienInvitation,
  peutGererLEquipe,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../../domain'
import { envoyerUneInvitation } from '../../../../implementation/email'

export type EchecDeRelance =
  | ActionNonAutorisee
  | InvitationIntrouvable
  | InvitationDejaTraitee
  | CoordinateurIntrouvable
  | EnvoiEchoue

const envoyer = async (
  envoi: Parameters<typeof envoyerUneInvitation>[0],
): Promise<boolean> => {
  try {
    await envoyerUneInvitation(envoi)
    return true
  } catch {
    return false
  }
}

export const relancerUneInvitation = async ({
  reference,
  gestionnaire,
  auteurId,
  maintenant = new Date(),
}: {
  reference: ReferenceInvitation
  gestionnaire: Gestionnaire
  auteurId: UtilisateurId
  maintenant?: Date
}): Promise<Result<void, EchecDeRelance>> => {
  if (!peutGererLEquipe(gestionnaire)(reference.coordinateurId))
    return failure(ActionNonAutorisee())

  const invitation = await lireUneInvitation(reference)
  if (invitation === null) return failure(InvitationIntrouvable())

  const enAttente = exigerEnAttente(invitation)
  if (!enAttente.success) return enAttente

  const coordinateur = await lireLeCoordinateur(reference.coordinateurId)
  if (coordinateur === null) return failure(CoordinateurIntrouvable())

  const envoyee = await envoyer({
    invite: enAttente.data.invite,
    lien: lienInvitation(reference),
    de: coordinateur.nom,
  })
  if (!envoyee) return failure(EnvoiEchoue())

  await prismaClient.invitationEquipe.update({
    where: cleDeLInvitation(reference),
    data: { renvoyee: maintenant },
  })

  addMutationLog({
    userId: auteurId,
    nom: 'RenvoyerInvitationMediateurCoordonne',
    duration: 0,
    data: { email: reference.email, coordinateurId: reference.coordinateurId },
  })

  return success(undefined)
}
