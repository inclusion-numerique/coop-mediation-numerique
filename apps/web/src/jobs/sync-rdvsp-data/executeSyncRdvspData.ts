import { output } from '@app/cli/output'
import { getAdministrationRdvspData } from '@app/web/features/rdvsp/abilities/administrer-comptes-rdv/implementation/prisma/comptes-rdv.query'
import { declencherSynchronisationBinding as declencher } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/implementation/declencher-synchronisation.binding'
import { peutEtreSynchronise } from '@app/web/features/rdvsp/domain/sante-compte'
import { UtilisateurCoopId } from '@app/web/features/rdvsp/domain/utilisateur-coop-id'
import type { SyncRdvspDataJob } from './syncRdvspDataJob'

export const executeSyncRdvspData = async (_job: SyncRdvspDataJob) => {
  output('Starting RDVSP data sync for all eligible users...')

  const { users } = await getAdministrationRdvspData()

  const eligibleUsers = users.filter(
    (utilisateur) =>
      peutEtreSynchronise(utilisateur.sante) && utilisateur.rdvAccount,
  )

  output(
    `Found ${users.length} users with RDV account; ${eligibleUsers.length} eligible for sync`,
  )

  const synced = await eligibleUsers.reduce(async (precedent, user) => {
    const acquis = await precedent

    output(
      `Syncing user ${user.id} (${user.email ?? user.name ?? 'unknown'})...`,
    )

    const utilisateurId = UtilisateurCoopId(user.id)

    const resultat = await declencher({
      demandeur: { id: utilisateurId, role: 'User' },
      utilisateurId,
      seulementSansWebhook: false,
    })

    if (!resultat.success) {
      output(`Error syncing user ${user.id}: ${resultat.error._tag}`)
      return acquis
    }

    return acquis + 1
  }, Promise.resolve(0))

  output(
    `Completed RDVSP sync. Synced ${synced}/${eligibleUsers.length} eligible users`,
  )

  return {
    totalUsers: users.length,
    eligibleUsers: eligibleUsers.length,
    synced,
  }
}
