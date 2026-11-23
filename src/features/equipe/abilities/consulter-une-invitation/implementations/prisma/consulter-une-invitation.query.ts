import { prismaClient } from '@/configuration/prisma/prismaClient'
import type { EncodedState } from '@/libraries/parametres-d-url/encodeSerializableState'
import { type Email, referenceDuCode } from '../../../../domain'
import { lireLeCoordinateur } from '../../../../implementations/prisma/coordinateur.query'
import { lireUneInvitation } from '../../../../implementations/prisma/invitation.query'
import { type VueInvitation, vueInvitation } from '../../domain'

export const consulterUneInvitation = async ({
  code,
  session,
}: {
  code: EncodedState<unknown>
  session: Email | null
}): Promise<VueInvitation> => {
  const reference = referenceDuCode(code)
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
