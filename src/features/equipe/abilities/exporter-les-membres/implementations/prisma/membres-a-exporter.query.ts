import { prismaClient } from '@/configuration/prisma'
import {
  filtresEquipe,
  type LigneEquipeRow,
  lignesEquipeCte,
  triEquipe,
} from '../../../../implementations/prisma/ligne-equipe.sql'
import { toLignesEquipe } from '../../../../implementations/prisma/ligne-equipe.transfer'
import type { LireLesMembresAExporter } from '../../domain/ports'

export const lireLesMembresAExporter: LireLesMembresAExporter = async ({
  coordinateurId,
  criteres,
  maintenant,
}) =>
  toLignesEquipe(
    await prismaClient.$queryRaw<LigneEquipeRow[]>`
      ${lignesEquipeCte({ coordinateurId, maintenant })}
      SELECT * FROM lignes
      ${filtresEquipe(criteres)}
      ${triEquipe(criteres)}`,
  )
