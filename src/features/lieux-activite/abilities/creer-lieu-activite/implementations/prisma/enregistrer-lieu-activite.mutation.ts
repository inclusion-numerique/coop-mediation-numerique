import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import { estPublie } from '../../../../domain/cartographie-nationale/visibilite-cartographie'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import type { Lieu } from '../../../../domain/lieu'
import {
  lieuDisparu,
  preparerLeLieu,
} from '../../../../implementations/prisma/destination-du-lieu.mutation'
import { lieuFromDomain } from '../../../../implementations/prisma/lieu.transfer'
import {
  identiteDuLieu,
  toutesLesColonnes,
} from '../../../../implementations/prisma/registre/colonnes-a-ecrire.select'
import { ecrireAuRegistre } from '../../../../implementations/prisma/registre/ecrire-au-registre.mutation'
import type {
  EnregistrementDuLieu,
  EnregistrerLieuActivite,
} from '../../domain/ports'

const rattacher = async (
  transaction: Prisma.TransactionClient,
  {
    mediateurId,
    structureId,
    debut,
    creationParId,
  }: {
    readonly mediateurId: MediateurId
    readonly structureId: LieuId
    readonly debut: Date
    readonly creationParId: string | null
  },
) => {
  const dejaRattache = await transaction.mediateurEnActivite.findFirst({
    where: { mediateurId, structureId, suppression: null, fin: null },
    select: { id: true },
  })

  if (dejaRattache) return

  await transaction.mediateurEnActivite.create({
    data: { id: v4(), mediateurId, structureId, debut, creationParId },
  })
}

const colonnesDuFormulaire = (lieu: Lieu) =>
  estPublie(lieu.visibilite) ? toutesLesColonnes : identiteDuLieu

const creerLaFiche =
  (transaction: Prisma.TransactionClient) =>
  async (id: LieuId, lieu: Lieu): Promise<{ readonly id: string }> => {
    const cree = await transaction.lieuInclusion.create({
      data: { ...lieuFromDomain(lieu), id },
      select: { id: true },
    })

    await ecrireAuRegistre(transaction, {
      lieu,
      colonnes: colonnesDuFormulaire(lieu),
      maintenant: lieu.tracabilite.creation.date,
    })

    return cree
  }

export const enregistrerLieuActivite: EnregistrerLieuActivite = async ({
  destination,
  mediateurId,
  debut,
  par,
}) =>
  prismaClient.$transaction(
    async (transaction): Promise<EnregistrementDuLieu> => {
      const disparu = await lieuDisparu(transaction, [destination])

      if (disparu !== null) return { _tag: 'LieuDisparu', lieuId: disparu }

      await preparerLeLieu(transaction, destination, {
        maintenant: debut,
        creer: creerLaFiche(transaction),
      })

      await rattacher(transaction, {
        mediateurId,
        structureId: destination.id,
        debut,
        creationParId: par,
      })

      return { _tag: 'Enregistre' }
    },
  )
