import { v4 } from 'uuid'
import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import {
  type LieuAMaterialiser,
  lieuCorrele,
  preparerCorrele,
} from '../../../../implementations/prisma/lieu-correle.mutation'
import {
  ecrireLeLieuAuRegistre,
  identiteDuLieu,
  inscriptionPourLIdentifiantCarto,
} from '../../../../implementations/prisma/registre'

export type LieuDecrit = LieuAMaterialiser &
  Omit<Prisma.LieuInclusionCreateManyInput, 'id'>

const materialiser = async (
  transaction: Prisma.TransactionClient,
  lieu: LieuDecrit,
): Promise<{ readonly id: string }> => {
  const cree = await transaction.lieuInclusion.create({
    data: { id: v4(), ...lieu },
    include: { inscriptionRegistre: inscriptionPourLIdentifiantCarto },
  })

  await ecrireLeLieuAuRegistre(transaction, {
    ligne: cree,
    colonnes: identiteDuLieu,
    maintenant: cree.creation,
  })

  return { id: cree.id }
}

export const rattacherAuLieuDecrit = async ({
  userId,
  lieu,
  trace,
}: {
  readonly userId: string
  readonly lieu: LieuDecrit
  readonly trace: Prisma.InputJsonObject
}): Promise<void> => {
  const maintenant = new Date()

  await prismaClient.$transaction(async (transaction) => {
    const correle = await lieuCorrele(transaction, lieu)
    const prepare =
      correle && (await preparerCorrele(transaction, correle, maintenant))

    const { id: structureId } =
      prepare ?? (await materialiser(transaction, lieu))

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
      data: trace,
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

export const detacherDuLieuDecrit = async ({
  userId,
  lieu,
  trace,
}: {
  readonly userId: string
  readonly lieu: LieuAMaterialiser
  readonly trace: Prisma.InputJsonObject
}): Promise<void> => {
  const correle = await lieuCorrele(prismaClient, lieu)

  if (!correle) return

  addMutationLog({
    userId,
    nom: 'SupprimerMediateurEnActivite',
    data: trace,
  })

  const maintenant = new Date()

  await prismaClient.mediateurEnActivite.updateMany({
    where: {
      mediateur: { userId },
      structureId: correle.id,
      suppression: null,
      fin: null,
    },
    data: {
      fin: maintenant,
      suppression: maintenant,
      suppressionParId: userId,
    },
  })
}
