import { prismaClient } from '@/configuration/prisma'
import type { Courriel, ReferenceInvitation } from '../../../../domain'
import { lireLeCoordinateur } from '../../../../implementations/prisma/coordinateur.query'
import { lireUneInvitation } from '../../../../implementations/prisma/invitation.query'
import { type VueInvitation, vueInvitation } from '../../domain'

export const consulterUneInvitation = async ({
  reference,
  session,
}: {
  reference: ReferenceInvitation | null
  session: Courriel | null
}): Promise<VueInvitation> => {
  if (reference === null) return { type: 'Illisible' }

  const [lue, coordinateur, tailleEquipe] = await Promise.all([
    lireUneInvitation(reference),
    lireLeCoordinateur(reference.coordinateurId),
    prismaClient.mediateurCoordonne.count({
      where: { coordinateurId: reference.coordinateurId, suppression: null },
    }),
  ])

  return vueInvitation({
    invitation: lue?.invitation ?? null,
    session,
    coordinateur,
    tailleEquipe,
  })
}
