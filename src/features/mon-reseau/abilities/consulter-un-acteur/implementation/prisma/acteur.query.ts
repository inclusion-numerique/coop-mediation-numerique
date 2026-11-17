import { prismaClient } from '@app/web/prismaClient'
import { acteurVisibleWhere } from '../../../../db/acteur.sql'
import { acteurSelect, versActeur } from '../../../../db/acteur.transfer'
import type { LireLActeur } from '../../domain'

export const lireLActeur: LireLActeur = async (acteurId) => {
  const ligne = await prismaClient.user.findFirst({
    where: { id: acteurId, ...acteurVisibleWhere },
    select: { ...acteurSelect, created: true },
  })
  const acteur = ligne === null ? null : versActeur(ligne)

  return ligne === null || acteur === null
    ? null
    : { acteur, profilCreeLe: ligne.created }
}
