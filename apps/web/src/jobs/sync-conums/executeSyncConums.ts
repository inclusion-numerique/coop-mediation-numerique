import { output } from '@app/cli/output'
import { conumsByEmailPro } from '@app/web/features/conum/use-cases/sync-profiles/db/conumsByEmailPro'
import { conumsToSync } from '@app/web/features/conum/use-cases/sync-profiles/db/conumsToSync'
import { coordinateursToSync } from '@app/web/features/conum/use-cases/sync-profiles/db/coordinateursToSync'
import { syncMatchingConseillersNumeriques } from '@app/web/features/conum/use-cases/sync-profiles/db/syncMatchingConseillersNumeriques'
import { syncMatchingCoodinateurs } from '@app/web/features/conum/use-cases/sync-profiles/db/syncMatchingCoodinateurs'
import { usersMatchingconumsEmailPro } from '@app/web/features/conum/use-cases/sync-profiles/db/usersMatchingconumsEmailPro'
import { SyncConumsJob } from './syncConumsJob'

export const executeSyncConums = async (_job: SyncConumsJob) => {
  output('Syncing conseillers numériques...')

  const mongoConseillerByEmail = await conumsByEmailPro()
  const users = await usersMatchingconumsEmailPro(mongoConseillerByEmail)

  const mediateurs = await conumsToSync(users)
  output(`Found ${mediateurs.length} not referenced conseillers numériques`)

  const coordinateurs = await coordinateursToSync(users)
  output(
    `Found ${coordinateurs.length} not referenced coordinateurs de conseillers numériques`,
  )

  await syncMatchingConseillersNumeriques(mongoConseillerByEmail)(mediateurs)
  await syncMatchingCoodinateurs(mongoConseillerByEmail)(coordinateurs)

  output('Successfully synced conseillers numériques')
}
