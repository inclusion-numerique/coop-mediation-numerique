import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { LieuAMaterialiser } from '../../../../domain/lieu-identite'
import {
  lieuDisparu,
  preparerLeLieu,
} from '../../../../implementations/prisma/destination-du-lieu.mutation'
import { identiteDuLieu } from '../../../../implementations/prisma/registre/colonnes-a-ecrire.select'
import { ecrireLeLieuAuRegistre } from '../../../../implementations/prisma/registre/ecrire-au-registre.mutation'
import { inscriptionPourLIdentifiantCarto } from '../../../../implementations/prisma/registre/identifiants-carto.query'
import type { DestinationDuLieu, RattachementAuxLieux } from '../../domain'
import { rattacherSiAbsent } from './destinations.mutation'

export type LieuDecrit = LieuAMaterialiser &
  Omit<Prisma.LieuInclusionCreateManyInput, 'id'>

const creerLeLieuDecrit =
  (transaction: Prisma.TransactionClient) =>
  async (id: LieuId, lieu: LieuDecrit): Promise<{ readonly id: string }> => {
    const cree = await transaction.lieuInclusion.create({
      data: { ...lieu, id },
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
  utilisateurId,
  destination,
  trace,
  maintenant,
}: {
  readonly utilisateurId: string
  readonly destination: DestinationDuLieu<LieuDecrit>
  readonly trace: Prisma.InputJsonObject
  readonly maintenant: Date
}): Promise<RattachementAuxLieux> =>
  prismaClient.$transaction(
    async (transaction): Promise<RattachementAuxLieux> => {
      const disparu = await lieuDisparu(transaction, [destination])

      if (disparu !== null) return { _tag: 'LieuDisparu', lieuId: disparu }

      await preparerLeLieu(transaction, destination, {
        maintenant,
        creer: creerLeLieuDecrit(transaction),
      })

      await rattacherSiAbsent(transaction, {
        utilisateurId,
        lieuId: destination.id,
        debut: maintenant,
        creationParId: null,
        journaliser: () =>
          addMutationLog({
            userId: utilisateurId,
            nom: 'CreerMediateurEnActivite',
            data: trace,
          }),
      })

      return { _tag: 'Rattaches' }
    },
  )

export const detacherDuLieu = async ({
  utilisateurId,
  lieuId,
  trace,
  maintenant,
}: {
  readonly utilisateurId: string
  readonly lieuId: string
  readonly trace: Prisma.InputJsonObject
  readonly maintenant: Date
}): Promise<void> => {
  addMutationLog({
    userId: utilisateurId,
    nom: 'SupprimerMediateurEnActivite',
    data: trace,
  })

  await prismaClient.mediateurEnActivite.updateMany({
    where: {
      mediateur: { userId: utilisateurId },
      structureId: lieuId,
      suppression: null,
      fin: null,
    },
    data: {
      fin: maintenant,
      suppression: maintenant,
      suppressionParId: utilisateurId,
    },
  })
}
