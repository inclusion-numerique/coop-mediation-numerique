import { prismaClient } from '@app/web/prismaClient'
import { lieuALAnnuaireDuDepartement } from './lieu-a-l-annuaire.sql'

export const nombreDeLieuxDuDepartement = async (
  departementCode: string,
): Promise<number> => {
  const [resultat] = await prismaClient.$queryRaw<[{ nombre: number }]>`
    SELECT COUNT(*)::integer AS nombre
    FROM lieu_inclusion s
    WHERE ${lieuALAnnuaireDuDepartement(departementCode)}
  `
  return resultat?.nombre ?? 0
}
