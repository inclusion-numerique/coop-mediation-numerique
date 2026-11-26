import { prismaClient } from '@/configuration/prisma'
import {
  DEPARTEMENT_PAR_DEFAUT,
  departementDeLActeur,
} from '@/libraries/departement'
import { type CodeDepartement, CodeInsee } from '@/libraries/insee'
import type { CoordinateurId } from '../../../../domain'
import { lireLeCoordinateur } from '../../../../implementations/prisma/coordinateur.query'
import type { CoordinateurDeLEquipe } from '../../domain/lister-les-membres'

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

export const coordinateurDeLEquipe: CoordinateurDeLEquipe = async (
  coordinateurId,
) => {
  const [coordinateur, departementCode] = await Promise.all([
    lireLeCoordinateur(coordinateurId),
    departementDuCoordinateur(coordinateurId),
  ])

  return coordinateur === null ? null : { ...coordinateur, departementCode }
}
