import {
  lieuCorrele,
  preparerCorrele,
} from '@app/web/features/inscription/implementation/prisma/lieu-correle'
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
 * existe déjà, on s'y rattache au lieu d'en créer un second, si bien que deux
 * médiateurs du même établissement voient un seul lieu.
 *
 * La reconnaissance passe par la sonde de corrélation de la feature, comme les
 * autres chemins de matérialisation : le lieu que la coop connaît déjà ne porte
 * pas forcément la dénomination de `main`, et une comparaison à l'identique en
 * créerait un doublon.
 */
export const lierStructureEmployeuseEnLieu: LierStructureEmployeuseEnLieu =
  async ({ userId, structureEmployeuseId }) => {
    const lieuData = await lieuDepuisEmployeuse(structureEmployeuseId)

    await prismaClient.$transaction(async (transaction) => {
      const correle = await lieuCorrele(transaction, lieuData)
      const prepare = correle && (await preparerCorrele(transaction, correle))

      const { id: structureId } =
        prepare ??
        (await transaction.lieuInclusion.create({
          data: { id: v4(), ...lieuData },
          select: { id: true },
        }))

      const dejaRattache = await transaction.mediateurEnActivite.findFirst({
        where: {
          mediateur: { userId },
          structureId,
          suppression: null,
          fin: null,
        },
        select: { id: true },
      })

      if (dejaRattache) return

      addMutationLog({
        userId,
        nom: 'CreerMediateurEnActivite',
        duration: 0,
        data: { userId, structureId: structureEmployeuseId },
      })

      await transaction.mediateurEnActivite.create({
        data: {
          id: v4(),
          mediateur: { connect: { userId } },
          lieuInclusion: { connect: { id: structureId } },
          debut: new Date(),
        },
      })
    })
  }
