import { addMutationLog, prismaClient } from '@/configuration/prisma'
import { signaler } from '@/configuration/telemetry/serveur'
import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  CoordinateurIntrouvable,
  EnvoiEchoue,
  exigerEnAttente,
  exigerUneRelancePossible,
  type Gestionnaire,
  type InvitationDejaTraitee,
  InvitationIntrouvable,
  peutGererLEquipe,
  type ReferenceInvitation,
  type RelanceTropRecente,
  type UtilisateurId,
} from '../../../../domain'
import { envoyerUneInvitation } from '../../../../implementations/email'
import { lireLeCoordinateur } from '../../../../implementations/prisma/coordinateur.query'
import { lireUneInvitation } from '../../../../implementations/prisma/invitation.query'

export type EchecDeRelance =
  | ActionNonAutorisee
  | InvitationIntrouvable
  | InvitationDejaTraitee
  | RelanceTropRecente
  | CoordinateurIntrouvable
  | EnvoiEchoue

const envoyer = async (
  envoi: Parameters<typeof envoyerUneInvitation>[0],
): Promise<boolean> => {
  try {
    await envoyerUneInvitation(envoi)
    return true
  } catch (erreur) {
    signaler(erreur)
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

  const lue = await lireUneInvitation(reference)
  if (lue === null) return failure(InvitationIntrouvable())

  const enAttente = exigerEnAttente(lue.invitation)
  if (!enAttente.success) return enAttente

  const relancable = exigerUneRelancePossible(enAttente.data, maintenant)
  if (!relancable.success) return relancable

  const coordinateur = await lireLeCoordinateur(reference.coordinateurId)
  if (coordinateur === null) return failure(CoordinateurIntrouvable())

  const envoyee = await envoyer({
    invitation: enAttente.data,
    de: coordinateur.nom,
  })
  if (!envoyee) return failure(EnvoiEchoue())

  await prismaClient.invitationEquipe.update({
    where: lue.cle,
    data: { renvoyee: maintenant },
  })

  addMutationLog({
    userId: auteurId,
    nom: 'RenvoyerInvitationMediateurCoordonne',
    data: { email: reference.email, coordinateurId: reference.coordinateurId },
  })

  return success(undefined)
}
