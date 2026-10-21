import {
  employeuseSessionEmplois,
  personneEmployeuseSelect,
  personneToEmployeuseActuelle,
} from '@app/web/features/employeuse/server'
import { getDepartementCodeForActeur } from '@app/web/features/mon-reseau/getDepartementCodeForActeur'
import { prismaClient } from '@app/web/prismaClient'
import { lireLeCoordinateur } from '../../../../db/coordinateur.query'
import { CodeDepartement, type CoordinateurId } from '../../../../domain'
import type { CoordinateurDeLaListe } from '../../domain'

const departementDuCoordinateur = async (
  coordinateurId: CoordinateurId,
): Promise<CodeDepartement | null> => {
  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { id: coordinateurId },
    select: {
      user: { select: { personneMain: { select: personneEmployeuseSelect } } },
    },
  })

  return CodeDepartement.safe(
    getDepartementCodeForActeur({
      emplois: employeuseSessionEmplois(
        personneToEmployeuseActuelle(coordinateur?.user.personneMain ?? null),
      ),
    }),
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
