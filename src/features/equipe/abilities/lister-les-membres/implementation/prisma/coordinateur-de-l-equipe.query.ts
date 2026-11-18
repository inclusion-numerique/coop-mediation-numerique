import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  employeuseCodeInsee,
  personneEmployeuseSelect,
  personneToEmployeuseActuelle,
} from '@/features/employeuse/server'
import {
  DEPARTEMENT_PAR_DEFAUT,
  departementDeLActeur,
} from '@/libraries/departement'
import { type CodeDepartement, CodeInsee } from '@/libraries/insee'
import { lireLeCoordinateur } from '../../../../db/coordinateur.query'
import type { CoordinateurId } from '../../../../domain'
import type { CoordinateurDeLaListe } from '../../domain'

const departementDuCoordinateur = async (
  coordinateurId: CoordinateurId,
): Promise<CodeDepartement> => {
  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { id: coordinateurId },
    select: {
      user: { select: { personneMain: { select: personneEmployeuseSelect } } },
    },
  })

  const actuelle = personneToEmployeuseActuelle(
    coordinateur?.user.personneMain ?? null,
  )

  return (
    departementDeLActeur({
      employeuse: CodeInsee.safe(
        actuelle === null
          ? ''
          : (employeuseCodeInsee(actuelle.employeuse) ?? ''),
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
