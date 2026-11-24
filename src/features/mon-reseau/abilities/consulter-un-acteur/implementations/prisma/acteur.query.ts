import { prismaClient } from '@/configuration/prisma/prisma-client'
import { acteurVisibleWhere } from '../../../../implementations/prisma/acteur.sql'
import {
  acteurSelect,
  versActeur,
} from '../../../../implementations/prisma/acteur.transfer'
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
