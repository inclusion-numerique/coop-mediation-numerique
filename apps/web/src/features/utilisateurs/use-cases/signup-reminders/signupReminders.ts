import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import { sendAccountDeletedEmail } from './emails/account-deleted/sendAccountDeletedEmail'
import { sendDeletionWarningEmail } from './emails/deletion-warning/sendDeletionWarningEmail'
import { sendFinishYourSignupEmail } from './emails/finish-your-signup/sendFinishYourSignupEmail'

const inscriptionFilter = (
  created: {
    lt?: Date
    gte?: Date
  },
  previousOnboardingStatus:
    | 'reminder_j7_sent'
    | 'reminder_j30_sent'
    | 'reminder_j60_sent'
    | 'warning_j90_sent'
    | null,
): Prisma.UserWhereInput => ({
  inscriptionValidee: null,
  OR: [
    { onboardingStatus: previousOnboardingStatus },
    { onboardingStatus: null },
  ],
  role: { not: 'Admin' },
  deleted: null,
  created,
})

const select = {
  id: true,
  email: true,
  firstName: true,
  created: true,
}

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000

const daysAgo = (now: Date, days: number) =>
  new Date(now.getTime() - days * MILLISECONDS_IN_DAY)

const deleteAndNotify = async (now: Date) => {
  const usersToDelete = await prismaClient.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
    where: {
      ...inscriptionFilter({ lt: daysAgo(now, 105) }, 'warning_j90_sent'),
      AND: [
        { NOT: { mediateur: { activites: { some: {} } } } },
        { NOT: { coordinateur: { mediateursCoordonnes: { some: {} } } } },
      ],
    },
  })

  for (const user of usersToDelete) {
    const { id: userId, mediateur, coordinateur } = user

    await prismaClient.$transaction(async (tx) => {
      await tx.employeStructure.deleteMany({
        where: { userId: userId },
      })

      if (mediateur) {
        await tx.mediateurCoordonne.deleteMany({
          where: { mediateurId: mediateur.id },
        })

        await tx.mediateurEnActivite.deleteMany({
          where: { mediateurId: mediateur.id },
        })

        await tx.conseillerNumerique.deleteMany({
          where: { mediateurId: mediateur.id },
        })

        await tx.mediateur.delete({ where: { id: mediateur.id } })
      }

      if (coordinateur) {
        await tx.coordinateur.delete({ where: { id: coordinateur.id } })
      }

      await tx.user.delete({ where: { id: userId } })
    })

    await sendAccountDeletedEmail({
      email: user.email,
      firstname: user.firstName,
    })
  }
}

const warnBeforeDeletion = async (now: Date) => {
  const usersToWarnBeforeDeletion = await prismaClient.user.findMany({
    select,
    where: inscriptionFilter({ lt: daysAgo(now, 90) }, 'reminder_j60_sent'),
  })

  await prismaClient.user.updateMany({
    where: { id: { in: usersToWarnBeforeDeletion.map((user) => user.id) } },
    data: { onboardingStatus: 'warning_j90_sent' },
  })

  for (const user of usersToWarnBeforeDeletion) {
    const expectedDeletionDate =
      new Date(user.created).getTime() + 105 * MILLISECONDS_IN_DAY

    const timeDiff = expectedDeletionDate - now.getTime()

    await sendDeletionWarningEmail({
      email: user.email,
      firstname: user.firstName,
      deletionDate: new Date(
        timeDiff < 0
          ? now.getTime() + MILLISECONDS_IN_DAY
          : expectedDeletionDate,
      ).toLocaleDateString('fr-FR'),
      daysRemaining:
        timeDiff < 0 ? 1 : Math.ceil(timeDiff / MILLISECONDS_IN_DAY),
      matomoCampaignId: 'finaliser_inscription_j90',
    })
  }
}

const remindersAfterXDays =
  (now: Date, totalUsers: number) => async (days: 7 | 30 | 60) => {
    const usersToRemind = await prismaClient.user.findMany({
      select,
      where: inscriptionFilter({ lt: daysAgo(now, days) }, null),
    })

    await prismaClient.user.updateMany({
      where: { id: { in: usersToRemind.map((user) => user.id) } },
      data: { onboardingStatus: `reminder_j${days}_sent` },
    })

    for (const user of usersToRemind) {
      await sendFinishYourSignupEmail({
        email: user.email,
        firstname: user.firstName,
        totalUsers,
        matomoCampaignId: `finaliser_inscription_j${days}`,
      })
    }
  }

export const signupReminders = async () => {
  const now = new Date()

  const totalUsers = await prismaClient.user.count({
    where: {
      role: 'User',
      isFixture: false,
      deleted: null,
      inscriptionValidee: { not: null },
    },
  })

  await deleteAndNotify(now)
  await warnBeforeDeletion(now)
  await remindersAfterXDays(now, totalUsers)(60)
  await remindersAfterXDays(now, totalUsers)(30)
  await remindersAfterXDays(now, totalUsers)(7)

  return {
    success: true,
  }
}
