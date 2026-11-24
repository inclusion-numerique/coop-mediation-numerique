import { prismaClient } from '@/configuration/prisma/prisma-client'
import {
  DEPARTEMENT_PAR_DEFAUT,
  departementDeLActeur,
} from '@/libraries/departement'
import { type CodeDepartement, CodeInsee } from '@/libraries/insee'
import type { CoordinateurId } from '../../../../domain'
import { lireLeCoordinateur } from '../../../../implementations/prisma/coordinateur.query'
import type { CoordinateurDeLaListe } from '../../domain'

const departementDuCoordinateur = async (
  coordinateurId: CoordinateurId,
): Promise<CodeDepartement> => {
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

export const coordinateurDeLEquipe = async (
  coordinateurId: CoordinateurId,
): Promise<CoordinateurDeLaListe | null> => {
  const [coordinateur, departementCode] = await Promise.all([
    lireLeCoordinateur(coordinateurId),
    departementDuCoordinateur(coordinateurId),
  ])

  return coordinateur === null ? null : { ...coordinateur, departementCode }
}
