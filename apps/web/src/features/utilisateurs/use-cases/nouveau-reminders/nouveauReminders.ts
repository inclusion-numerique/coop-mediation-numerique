import { prismaClient } from '@app/web/prismaClient'
import { countTotalActifUsers } from '../filter/db/count-total-actif-users'
import { nouveauFilter } from '../filter/db/nouveau-filter'
import { sendNouveauAccountDeletedEmail } from './emails/account-deleted/sendNouveauAccountDeletedEmail'
import { sendNouveauAccountDeletionWarningEmail } from './emails/deletion-warning/sendNouveauAccountDeletionWarningEmail'
import { sendGettingStartedEmail } from './emails/getting-started/sendGettingStartedEmail'
import { sendNouveauAccountEmail } from './emails/inactive-account/sendNouveauAccountEmail'

const select = {
  id: true,
  email: true,
  firstName: true,
  inscriptionValidee: true,
  mediateur: { select: { id: true } },
  coordinateur: { select: { id: true } },
}

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000

const daysAgo = (now: Date, days: number) =>
  new Date(now.getTime() - days * MILLISECONDS_IN_DAY)

const softDeleteUser = async (userId: string) => {
  const hash = Math.random().toString(36).substring(2, 15)

  await prismaClient.user.update({
    where: { id: userId },
    data: {
      deleted: new Date(),
      email: `deleted+${hash}@coop-numerique.anct.gouv.fr`,
      firstName: 'Utilisateur',
      lastName: 'Supprimé',
      name: 'Utilisateur Supprimé',
      phone: null,
    },
  })
}

const deleteAndNotify = async (now: Date) => {
  const usersToDelete = await prismaClient.user.findMany({
    select,
    where: {
      ...nouveauFilter({ lt: daysAgo(now, 105) }, ['warning_j90_sent']),
    },
  })

  for (const user of usersToDelete) {
    const isMediateur = user.mediateur !== null

    await softDeleteUser(user.id)

    await sendNouveauAccountDeletedEmail({
      email: user.email,
      isMediateur,
    })
  }
}

const warnBeforeDeletion = async (now: Date) => {
  const usersToWarnBeforeDeletion = await prismaClient.user.findMany({
    select,
    where: nouveauFilter({ lt: daysAgo(now, 90) }, [null, 'nouveau_j60_sent']),
  })

  await prismaClient.user.updateMany({
    where: { id: { in: usersToWarnBeforeDeletion.map((user) => user.id) } },
    data: { onboardingStatus: 'warning_j90_sent' },
  })

  for (const user of usersToWarnBeforeDeletion) {
    const expectedDeletionDate =
      new Date(user.inscriptionValidee!).getTime() + 105 * MILLISECONDS_IN_DAY

    const timeDiff = expectedDeletionDate - now.getTime()

    const isMediateur = user.mediateur !== null
    const isCoordinateur = user.coordinateur !== null

    await sendNouveauAccountDeletionWarningEmail({
      email: user.email,
      firstname: user.firstName,
      deletionDate: new Date(
        timeDiff < 0
          ? now.getTime() + MILLISECONDS_IN_DAY
          : expectedDeletionDate,
      ).toLocaleDateString('fr-FR'),
      daysRemaining:
        timeDiff < 0 ? 1 : Math.ceil(timeDiff / MILLISECONDS_IN_DAY),
      matomoCampaignId: 'compte_nouveau_j90',
      isMediateur,
      isCoordinateur,
    })
  }
}

const remindersAfterXDays =
  (now: Date, totalUsers: number) => async (days: 30 | 60) => {
    const previousStatus = days === 30 ? 'nouveau_j7_sent' : 'nouveau_j30_sent'

    const usersToRemind = await prismaClient.user.findMany({
      select,
      where: nouveauFilter({ lt: daysAgo(now, days) }, [null, previousStatus]),
    })

    await prismaClient.user.updateMany({
      where: { id: { in: usersToRemind.map((user) => user.id) } },
      data: { onboardingStatus: `nouveau_j${days}_sent` },
    })

    for (const user of usersToRemind) {
      const isMediateur = user.mediateur !== null
      const isCoordinateur = user.coordinateur !== null

      await sendNouveauAccountEmail({
        email: user.email,
        firstname: user.firstName,
        totalUsers,
        matomoCampaignId: `compte_nouveau_j${days}`,
        isMediateur,
        isCoordinateur,
        monthsCount: days === 30 ? 1 : 2,
      })
    }
  }

const gettingStartedReminder = async (now: Date) => {
  const usersToRemind = await prismaClient.user.findMany({
    select,
    where: nouveauFilter({ lt: daysAgo(now, 7) }, [null]),
  })

  await prismaClient.user.updateMany({
    where: { id: { in: usersToRemind.map((user) => user.id) } },
    data: { onboardingStatus: 'nouveau_j7_sent' },
  })

  for (const user of usersToRemind) {
    const isMediateur = user.mediateur !== null
    const isCoordinateur = user.coordinateur !== null

    await sendGettingStartedEmail({
      email: user.email,
      firstname: user.firstName,
      matomoCampaignId: 'compte_nouveau_j7',
      isMediateur,
      isCoordinateur,
    })
  }
}

const resetOnboardingStatus = async (now: Date) => {
  const usersToReset = await prismaClient.user.findMany({
    select,
    where: nouveauFilter({ gte: daysAgo(now, 7) }, [
      'nouveau_j7_sent',
      'nouveau_j30_sent',
      'nouveau_j60_sent',
      'warning_j90_sent',
    ]),
  })

  await prismaClient.user.updateMany({
    where: { id: { in: usersToReset.map((user) => user.id) } },
    data: { onboardingStatus: null },
  })
}

export const nouveauReminders = async () => {
  const now = new Date()

  const totalUsers = await countTotalActifUsers()

  await deleteAndNotify(now)
  await warnBeforeDeletion(now)
  await remindersAfterXDays(now, totalUsers)(60)
  await remindersAfterXDays(now, totalUsers)(30)
  await gettingStartedReminder(now)
  await resetOnboardingStatus(now)

  return {
    success: true,
  }
}
