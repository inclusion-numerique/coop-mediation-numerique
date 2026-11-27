import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import type { NouvelleAdhesion } from '../../../../domain'
import type { CleDInvitation } from '../../../../implementations/prisma/invitation.query'
import type { AdhesionALAcceptation } from '../../domain/acceptation'
import type { EnregistrerLAcceptation } from '../../domain/ports'

const adhesionActiveExiste = async (
  prisma: Prisma.TransactionClient,
  adhesion: NouvelleAdhesion,
): Promise<boolean> =>
  (await prisma.mediateurCoordonne.count({
    where: { ...adhesion, suppression: null },
  })) > 0

const enregistrerLAdhesion = async (
  prisma: Prisma.TransactionClient,
  adhesion: AdhesionALAcceptation,
): Promise<boolean> => {
  if (adhesion._tag === 'DejaMembre') return false

  const nouvelle: NouvelleAdhesion = {
    mediateurId: adhesion.mediateurId,
    coordinateurId: adhesion.coordinateurId,
  }
  if (await adhesionActiveExiste(prisma, nouvelle)) return false

  await prisma.mediateurCoordonne.create({ data: nouvelle })
  return true
}

export const enregistrerLAcceptation: EnregistrerLAcceptation<
  CleDInvitation
> = async ({ cle, reference, mediateurId, auteurId, accepteeLe, adhesion }) => {
  const adhesionEnregistree = await prismaClient.$transaction(
    async (prisma) => {
      await prisma.invitationEquipe.update({
        where: cle,
        data: { acceptee: accepteeLe, mediateurId },
      })

      return enregistrerLAdhesion(prisma, adhesion)
    },
  )

  addMutationLog({
    userId: auteurId,
    nom: 'AccepterInvitationMediateurCoordonne',
    data: {
      email: reference.email,
      coordinateurId: reference.coordinateurId,
    },
  })

  return { adhesionEnregistree }
}
