import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import type { Lieu } from '../../../../domain/lieu'
import type { EcritureAuRegistre } from '../../../../domain/registre/ecriture-au-registre'
import {
  lieuDisparu,
  preparerLeLieu,
} from '../../../../implementations/prisma/destination-du-lieu.mutation'
import { lieuFromDomain } from '../../../../implementations/prisma/lieu.transfer'
import { colonnesDeLEcriture } from '../../../../implementations/prisma/registre/colonnes-a-ecrire.select'
import { ecrireAuRegistre } from '../../../../implementations/prisma/registre/ecrire-au-registre.mutation'
import type {
  EnregistrementDuLieu,
  EnregistrerLieuActivite,
} from '../../domain/ports'
import type { RattachementDuMediateur } from '../../domain/rattachement-du-mediateur'

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
): Promise<RattachementDuMediateur> => {
  const dejaRattache = await transaction.mediateurEnActivite.findFirst({
    where: { mediateurId, structureId, suppression: null, fin: null },
    select: { id: true },
  })

  if (dejaRattache) return { _tag: 'DejaRattache' }

  await transaction.mediateurEnActivite.create({
    data: { id: v4(), mediateurId, structureId, debut, creationParId },
  })

  return { _tag: 'Rattache' }
}

const creerLaFiche =
  (
    transaction: Prisma.TransactionClient,
    ecritureAuRegistre: EcritureAuRegistre,
  ) =>
  async (id: LieuId, lieu: Lieu): Promise<{ readonly id: string }> => {
    const cree = await transaction.lieuInclusion.create({
      data: { ...lieuFromDomain(lieu), id },
      select: { id: true },
    })

    await ecrireAuRegistre(transaction, {
      lieu,
      colonnes: colonnesDeLEcriture[ecritureAuRegistre._tag],
      maintenant: lieu.tracabilite.creation.date,
    })

    return cree
  }

export const enregistrerLieuActivite: EnregistrerLieuActivite = async ({
  destination,
  mediateurId,
  debut,
  par,
  ecritureAuRegistre,
}) =>
  prismaClient.$transaction(
    async (transaction): Promise<EnregistrementDuLieu> => {
      const disparu = await lieuDisparu(transaction, [destination])

      if (disparu !== null) return { _tag: 'LieuDisparu', lieuId: disparu }

      await preparerLeLieu(transaction, destination, {
        maintenant: debut,
        creer: creerLaFiche(transaction, ecritureAuRegistre),
      })

      const rattachement = await rattacher(transaction, {
        mediateurId,
        structureId: destination.id,
        debut,
        creationParId: par,
      })

      return { _tag: 'Enregistre', rattachement }
    },
  )
