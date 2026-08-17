import { output } from '@app/cli/output'
import { getSessionUserFromId } from '@app/web/auth/getSessionUserFromSessionToken'
import { peutEtreSynchronise } from '@app/web/features/rdvsp/abilities/administrer-comptes-rdv/domain/sante-compte'
import { getAdministrationRdvspData } from '@app/web/features/rdvsp/abilities/administrer-comptes-rdv/implementation/prisma/comptes-rdv.query'
import { syncAllRdvData } from '@app/web/features/rdvsp/sync/syncAllRdvData'
import type { SyncRdvspDataJob } from './syncRdvspDataJob'

export const executeSyncRdvspData = async (_job: SyncRdvspDataJob) => {
  output('Starting RDVSP data sync for all eligible users...')

  const { users } = await getAdministrationRdvspData()

  // Éligibilité décidée par le domaine : un compte en erreur reste synchronisable,
  // c'est en réessayant qu'il en sort.
  const eligibleUsers = users.filter(
    (utilisateur) =>
      peutEtreSynchronise(utilisateur.sante) && utilisateur.rdvAccount,
  )

  output(
    `Found ${users.length} users with RDV account; ${eligibleUsers.length} eligible for sync`,
  )

  let synced = 0

  for (const user of eligibleUsers) {
    output(
      `Syncing user ${user.id} (${user.email ?? user.name ?? 'unknown'})...`,
    )
    const sessionUser = await getSessionUserFromId(user.id)
    if (!sessionUser.rdvAccount) {
      output(`Skipping user ${user.id}: missing rdvAccount in session user`)
      continue
    }

    try {
      await syncAllRdvData({
        compteId: sessionUser.rdvAccount.id,
        mediateurId: sessionUser.mediateur?.id,
      })

      synced += 1
    } catch (error) {
      output(`Error syncing user ${user.id}: ${error}`)
      continue
    }
  }

  output(
    `Completed RDVSP sync. Synced ${synced}/${eligibleUsers.length} eligible users`,
  )

  return {
    totalUsers: users.length,
    eligibleUsers: eligibleUsers.length,
    synced,
  }
}
