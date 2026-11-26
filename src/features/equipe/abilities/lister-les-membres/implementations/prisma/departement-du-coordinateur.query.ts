import { prismaClient } from '@/configuration/prisma'
import {
  DEPARTEMENT_PAR_DEFAUT,
  departementDeLActeur,
} from '@/libraries/departement'
import { CodeInsee } from '@/libraries/insee'
import type { LireLeDepartementDuCoordinateur } from '../../domain/ports'

export const lireLeDepartementDuCoordinateur: LireLeDepartementDuCoordinateur =
  async (coordinateurId) => {
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

    return (
      departementDeLActeur({
        employeuse: CodeInsee.safe(
          coordinateur?.user.personneMain?.employeuseActuelle?.codeInsee ?? '',
        ),
        lieux: [],
      }) ?? DEPARTEMENT_PAR_DEFAUT
    )
  }
