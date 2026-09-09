import {
  ecrireLeLieuAuRegistre,
  identiteDuLieu,
  inscriptionPourLIdentifiantCarto,
  lieuCorrele,
  preparerCorrele,
} from '@app/web/features/lieux-activite'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import type { Prisma } from '@prisma/client'
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
 *
 * Et matérialiser, c'est poser la fiche des deux côtés : dans la coop, et au
 * registre des lieux de l'Entrepôt, dans la même transaction. Sans quoi ce lieu
 * n'existerait pour le registre national qu'à sa première modification. Rien
 * n'est écrit quand la sonde a corrélé — on rejoint alors une fiche que la coop
 * connaissait déjà, et le registre n'a rien de nouveau à apprendre.
 */
/** La fiche posée dans la coop, puis au registre, dans la même transaction. */
const materialiser = async (
  transaction: Prisma.TransactionClient,
  lieuData: Awaited<ReturnType<typeof lieuDepuisEmployeuse>>,
): Promise<{ readonly id: string }> => {
  const cree = await transaction.lieuInclusion.create({
    data: { id: v4(), ...lieuData },
    include: { inscriptionRegistre: inscriptionPourLIdentifiantCarto },
  })

  await ecrireLeLieuAuRegistre(transaction, {
    ligne: cree,
    colonnes: identiteDuLieu,
    maintenant: cree.creation,
  })

  return { id: cree.id }
}

export const lierStructureEmployeuseEnLieu: LierStructureEmployeuseEnLieu =
  async ({ userId, structureEmployeuseId }) => {
    const lieuData = await lieuDepuisEmployeuse(structureEmployeuseId)

    await prismaClient.$transaction(async (transaction) => {
      const correle = await lieuCorrele(transaction, lieuData)
      const prepare = correle && (await preparerCorrele(transaction, correle))

      const { id: structureId } =
        prepare ?? (await materialiser(transaction, lieuData))

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
