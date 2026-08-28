import {
  createBrevoContact,
  deploymentCanCreateBrevoContact,
  toBrevoContact,
} from '@app/web/external-apis/brevo/createBrevoContact'
import {
  personneConseillerNumeriqueSelect,
  personneEstConseillerNumerique,
} from '@app/web/features/employeuse/server'
import { prismaClient } from '@app/web/prismaClient'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import type { EffetsApresValidation } from '../domain/ports'

const isMediateur = (
  user: { email: string; mediateur: { id: string } | null } | null,
): user is { email: string; mediateur: { id: string } } =>
  user?.mediateur?.id != null

/**
 * Effets consécutifs à la validation (parité avec le legacy) : synchronise le
 * contact Brevo (hors E2E / hors prod, `deploymentCanCreateBrevoContact` le
 * neutralise), puis, pour un médiateur, accepte ses invitations d'équipe en
 * attente et crée les liens de coordination correspondants.
 */
export const effetsApresValidation: EffetsApresValidation = async (userId) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      coordinateur: true,
      mediateur: { select: { id: true } },
      personneMain: { select: personneConseillerNumeriqueSelect },
    },
  })

  if (user != null && deploymentCanCreateBrevoContact()) {
    await createBrevoContact({
      // Dispositif dérivé de l'affectation `idposte` active (ADR-002) : Brevo
      // reçoit l'état réel du dispositif, pas la copie qu'une synchro nocturne
      // posait sur `coop.users`.
      contact: toBrevoContact({
        ...user,
        isConseillerNumerique: personneEstConseillerNumerique(
          user.personneMain,
        ),
      }),
      listIds: [ServerWebAppConfig.Brevo.usersListId],
    })
  }

  if (!isMediateur(user)) return

  await prismaClient.invitationEquipe.updateMany({
    where: { email: user.email, acceptee: null, refusee: null },
    data: { acceptee: new Date() },
  })

  const invitations = await prismaClient.invitationEquipe.findMany({
    where: { email: user.email, acceptee: { not: null } },
  })

  await prismaClient.mediateurCoordonne.createMany({
    data: invitations.map((invitation) => ({
      coordinateurId: invitation.coordinateurId,
      mediateurId: user.mediateur.id,
    })),
    skipDuplicates: true,
  })
}
