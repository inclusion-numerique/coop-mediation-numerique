import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { v4 } from 'uuid'
import type { LierStructureEmployeuseEnLieu } from '../../domain/ports'

/**
 * Rattache la structure employeuse comme lieu d'activité (parité legacy). La
 * structure employeuse est une `structure_administrative` (split), pas un lieu :
 * pour servir de lieu d'activité on matérialise une ligne `lieu_inclusion` à
 * partir de ses données, en réutilisant son id pour que l'idempotence (test
 * d'existence + branche « Non ») reste valable — aucune corrélation FK
 * employeuse↔lieu n'est conservée.
 */
export const lierStructureEmployeuseEnLieu: LierStructureEmployeuseEnLieu =
  async ({ userId, structureEmployeuseId }) => {
    const existing = await prismaClient.mediateurEnActivite.findFirst({
      where: {
        mediateur: { userId },
        structureId: structureEmployeuseId,
        suppression: null,
        fin: null,
      },
      select: { id: true },
    })

    if (existing) return

    const structureEmployeuse =
      await prismaClient.structureAdministrative.findUniqueOrThrow({
        where: { id: structureEmployeuseId },
        select: {
          id: true,
          nom: true,
          adresse: true,
          commune: true,
          codePostal: true,
          codeInsee: true,
          complementAdresse: true,
          siret: true,
          rna: true,
          nomReferent: true,
          courrielReferent: true,
          telephoneReferent: true,
        },
      })

    await prismaClient.lieuInclusion.upsert({
      where: { id: structureEmployeuseId },
      update: {},
      create: structureEmployeuse,
    })

    addMutationLog({
      userId,
      nom: 'CreerMediateurEnActivite',
      duration: 0,
      data: { userId, structureId: structureEmployeuseId },
    })

    await prismaClient.mediateurEnActivite.create({
      data: {
        id: v4(),
        mediateur: { connect: { userId } },
        lieuInclusion: { connect: { id: structureEmployeuseId } },
        debut: new Date(),
      },
    })
  }
