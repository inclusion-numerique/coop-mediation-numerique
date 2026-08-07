import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { v4 } from 'uuid'
import type { LierStructureEmployeuseEnLieu } from '../../domain/ports'
import { lieuDepuisEmployeuse } from './lieu-depuis-employeuse'

/**
 * Rattache l'employeuse comme lieu d'activité. L'employeuse est une
 * `main.structure_administrative`, pas un lieu : pour servir de lieu on
 * matérialise une ligne `coop.lieu_inclusion` portant ses données main.
 *
 * Le lieu est une photographie prise au moment du « Oui » : il ne se
 * resynchronise pas si l'employeuse déménage ensuite. Et il est partagé — s'il
 * existe déjà pour cette employeuse, on s'y rattache au lieu d'en créer un
 * second, si bien que deux médiateurs du même établissement voient un seul lieu.
 */
export const lierStructureEmployeuseEnLieu: LierStructureEmployeuseEnLieu =
  async ({ userId, structureEmployeuseId }) => {
    const { lieuData, lieuCorrele } = await lieuDepuisEmployeuse(
      structureEmployeuseId,
    )

    const existing = await prismaClient.mediateurEnActivite.findFirst({
      where: {
        mediateur: { userId },
        lieuInclusion: lieuCorrele,
        suppression: null,
        fin: null,
      },
      select: { id: true },
    })

    if (existing) return

    const lieuExistant = await prismaClient.lieuInclusion.findFirst({
      where: lieuCorrele,
      orderBy: { creation: 'asc' },
      select: { id: true },
    })

    const lieuActivite =
      lieuExistant ??
      (await prismaClient.lieuInclusion.create({
        data: { id: v4(), ...lieuData },
        select: { id: true },
      }))

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
        lieuInclusion: { connect: { id: lieuActivite.id } },
        debut: new Date(),
      },
    })
  }
