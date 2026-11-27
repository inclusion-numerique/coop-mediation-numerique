import { prismaClient } from '@/configuration/prisma'
import type {
  CoordinateurId,
  MediateurId,
  OperationRole,
  PlanDeChangement,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import type { Prisma } from '@/generated/prisma/client'

type Transaction = Prisma.TransactionClient

const retirerLeMediateur = async (
  tx: Transaction,
  utilisateurId: UtilisateurId,
  mediateurId: MediateurId,
) => {
  const coordinateur = await tx.coordinateur.findUniqueOrThrow({
    where: { userId: utilisateurId },
    select: { id: true },
  })
  await tx.mediateurCoordonne.deleteMany({ where: { mediateurId } })
  await tx.mediateurEnActivite.deleteMany({ where: { mediateurId } })
  await tx.invitationEquipe.deleteMany({ where: { mediateurId } })
  await tx.partageStatistiques.deleteMany({ where: { mediateurId } })
  await tx.tag.updateMany({
    where: { mediateurId },
    data: { mediateurId: null, coordinateurId: coordinateur.id },
  })
  await tx.mediateur.delete({ where: { id: mediateurId } })
}

const retirerLeCoordinateur = async (
  tx: Transaction,
  utilisateurId: UtilisateurId,
  coordinateurId: CoordinateurId,
) => {
  const mediateur = await tx.mediateur.findUniqueOrThrow({
    where: { userId: utilisateurId },
    select: { id: true },
  })
  await tx.mediateurCoordonne.deleteMany({ where: { coordinateurId } })
  await tx.invitationEquipe.deleteMany({ where: { coordinateurId } })
  await tx.partageStatistiques.deleteMany({ where: { coordinateurId } })
  await tx.tag.updateMany({
    where: { coordinateurId },
    data: { coordinateurId: null, mediateurId: mediateur.id },
  })
  await tx.coordinateur.delete({ where: { id: coordinateurId } })
}

const appliquer =
  (tx: Transaction, utilisateurId: UtilisateurId) =>
  async (operation: OperationRole): Promise<void> => {
    if (operation._tag === 'AjouterMediateur') {
      await tx.mediateur.create({ data: { userId: utilisateurId } })
      return
    }
    if (operation._tag === 'AjouterCoordinateur') {
      await tx.coordinateur.create({ data: { userId: utilisateurId } })
      return
    }
    if (operation._tag === 'RetirerMediateur') {
      await retirerLeMediateur(tx, utilisateurId, operation.mediateurId)
      return
    }
    await retirerLeCoordinateur(tx, utilisateurId, operation.coordinateurId)
  }

export const appliquerLePlan =
  (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  async (
    utilisateurId: UtilisateurId,
    { operations }: PlanDeChangement,
  ): Promise<void> => {
    await prismaClient.$transaction(async (tx) => {
      await operations.reduce<Promise<void>>(async (precedente, operation) => {
        await precedente
        await appliquer(tx, utilisateurId)(operation)
      }, Promise.resolve())
      await synchroniserLaPersonne(tx, utilisateurId)
    })
  }
