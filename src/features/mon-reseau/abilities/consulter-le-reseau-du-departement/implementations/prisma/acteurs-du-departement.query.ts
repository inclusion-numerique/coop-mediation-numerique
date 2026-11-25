import { prismaClient } from '@/configuration/prisma'
import { Effectif } from '../../../../domain'
import {
  ACTEUR,
  ACTEUR_VISIBLE,
  acteurDuDepartement,
  DEPUIS_LES_ACTEURS,
} from '../../../../implementations/prisma/acteur.sql'
import type { CompterLesActeursDuDepartement } from '../../domain'

export const compterLesActeursDuDepartement: CompterLesActeursDuDepartement =
  async (departement) => {
    const [resultat] = await prismaClient.$queryRaw<[{ nombre: number }]>`
      SELECT COUNT(DISTINCT ${ACTEUR.id})::integer AS nombre
      ${DEPUIS_LES_ACTEURS}
      WHERE ${ACTEUR_VISIBLE}
        AND ${acteurDuDepartement(departement)}
    `
    return Effectif(resultat?.nombre ?? 0)
  }
