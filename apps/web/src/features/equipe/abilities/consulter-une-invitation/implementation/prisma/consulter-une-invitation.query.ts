import { prismaClient } from '@app/web/prismaClient'
import type { EncodedState } from '@app/web/utils/encodeSerializableState'
import { lireLeCoordinateur } from '../../../../db/coordinateur.query'
import { lireUneInvitation } from '../../../../db/invitation.query'
import { type EmailInvitation, referenceDuCode } from '../../../../domain'
import { type VueInvitation, vueInvitation } from '../../domain'

export const consulterUneInvitation = async ({
  code,
  session,
}: {
  code: EncodedState<unknown>
  session: EmailInvitation | null
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
