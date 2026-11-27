import { prismaClient } from '@/configuration/prisma'
import { CodeInsee } from '@/libraries/insee'
import type { LireLaCommuneDuCoordinateur } from '../../domain/ports'

export const lireLaCommuneDuCoordinateur: LireLaCommuneDuCoordinateur = async (
  coordinateurId,
) => {
  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { id: coordinateurId },
    select: {
      user: {
        select: {
          personneMain: {
            select: { employeuseActuelle: { select: { codeInsee: true } } },
          },
        },
      },
    },
  })

  const codeInsee =
    coordinateur?.user.personneMain?.employeuseActuelle?.codeInsee ?? null

  return codeInsee === null ? null : CodeInsee(codeInsee)
}
