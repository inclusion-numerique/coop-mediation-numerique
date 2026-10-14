import {
  employeuseSessionEmplois,
  personneEmployeuseSelect,
  personneToEmployeuseActuelle,
} from '@app/web/features/employeuse/server'
import { getDepartementCodeForActeur } from '@app/web/features/mon-reseau/getDepartementCodeForActeur'
import { prismaClient } from '@app/web/prismaClient'
import type { CoordinateurId } from '../../../../domain'

export type CoordinateurDeLaListe = {
  readonly nom: string
  readonly email: string
  readonly telephone: string | null
  readonly departementCode: string
}

export const coordinateurDeLEquipe = async (
  coordinateurId: CoordinateurId,
): Promise<CoordinateurDeLaListe | null> => {
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
          personneMain: { select: personneEmployeuseSelect },
        },
      },
    },
  })
  if (coordinateur === null) return null

  const { user } = coordinateur

  return {
    nom:
      user.name ??
      ([user.firstName, user.lastName].filter(Boolean).join(' ') || user.email),
    email: user.email,
    telephone: user.phone,
    departementCode: getDepartementCodeForActeur({
      emplois: employeuseSessionEmplois(
        personneToEmployeuseActuelle(user.personneMain ?? null),
      ),
    }),
  }
}
