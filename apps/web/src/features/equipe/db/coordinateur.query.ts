import { prismaClient } from '@app/web/prismaClient'
import type { CoordinateurId } from '../domain'

export type CoordinateurDeLEquipe = {
  readonly nom: string
  readonly email: string
  readonly telephone: string | null
}

const nomAffiche = ({
  name,
  firstName,
  lastName,
  email,
}: {
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string
}): string => name ?? ([firstName, lastName].filter(Boolean).join(' ') || email)

export const lireLeCoordinateur = async (
  coordinateurId: CoordinateurId,
): Promise<CoordinateurDeLEquipe | null> => {
  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { id: coordinateurId },
    select: {
      user: {
        select: {
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  })

  return coordinateur === null
    ? null
    : {
        nom: nomAffiche(coordinateur.user),
        email: coordinateur.user.email,
        telephone: coordinateur.user.phone,
      }
}
