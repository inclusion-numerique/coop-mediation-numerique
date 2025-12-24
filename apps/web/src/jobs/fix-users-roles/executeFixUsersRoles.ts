import { output } from '@app/cli/output'
import { prismaClient } from '@app/web/prismaClient'

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000

const daysAgo = (now: Date, days: number) =>
  new Date(now.getTime() - days * MILLISECONDS_IN_A_DAY)

const fixCoordinateurRoles = async (now: Date) => {
  const coordinateursToDelete = await prismaClient.user.findMany({
    select: {
      id: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
    where: {
      role: { not: 'Admin' },
      deleted: null,
      mediateur: { isNot: null },
      coordinateur: {
        is: {
          mediateursCoordonnes: { none: {} },
          ActiviteCoordination: { none: {} },
          invitations: { none: {} },
          conseillerNumeriqueId: null,
        },
      },
      inscriptionValidee: { lte: daysAgo(now, 30) },
    },
  })

  await Promise.all(
    coordinateursToDelete.map(async ({ coordinateur, mediateur }) => {
      if (coordinateur == null || mediateur == null) return

      return prismaClient.$transaction(async (tx) => {
        await tx.tag.updateMany({
          where: { coordinateurId: coordinateur.id },
          data: {
            coordinateurId: null,
            mediateurId: mediateur.id,
          },
        })

        await tx.coordinateur.delete({
          where: { id: coordinateur.id },
        })
      })
    }),
  )

  output(`${coordinateursToDelete.length} rôles coordinateur ont été supprimés`)
}

const fixMediateurRoles = async (now: Date) => {
  const mediateursToDelete = await prismaClient.user.findMany({
    select: {
      id: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
    where: {
      role: { not: 'Admin' },
      deleted: null,
      mediateur: {
        is: {
          enActivite: { none: {} },
          beneficiaires: { none: {} },
          activites: { none: {} },
          conseillerNumerique: null,
        },
      },
      coordinateur: { isNot: null },
      inscriptionValidee: { lte: daysAgo(now, 30) },
    },
  })

  await Promise.all(
    mediateursToDelete.map(async ({ coordinateur, mediateur }) => {
      if (coordinateur == null || mediateur == null) return

      return prismaClient.$transaction(async (tx) => {
        await tx.invitationEquipe.deleteMany({
          where: { mediateurId: mediateur.id },
        })

        await tx.mediateurCoordonne.deleteMany({
          where: { mediateurId: mediateur.id },
        })

        await tx.tag.updateMany({
          where: { mediateurId: mediateur.id },
          data: {
            coordinateurId: coordinateur.id,
            mediateurId: null,
          },
        })

        await tx.mediateur.delete({
          where: { id: mediateur.id },
        })
      })
    }),
  )

  output(`${mediateursToDelete.length} rôles médiateur ont été supprimés`)
}

export const executeFixUsersRoles = async () => {
  const now = new Date()

  await fixCoordinateurRoles(now)
  await fixMediateurRoles(now)

  return {
    success: true,
  }
}
