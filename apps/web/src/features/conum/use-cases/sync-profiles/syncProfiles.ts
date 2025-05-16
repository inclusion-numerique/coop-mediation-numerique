import { conumsByEmailPro } from './db/conumsByEmailPro'
import { conumsToSync } from './db/conumsToSync'
import { coordinateursToSync } from './db/coordinateursToSync'
import { syncMatchingConseillersNumeriques } from './db/syncMatchingConseillersNumeriques'
import { syncMatchingCoodinateurs } from './db/syncMatchingCoodinateurs'
import { usersMatchingconumsEmailPro } from './db/usersMatchingconumsEmailPro'

export const syncProfiles = async () => {
  const mongoConseillerByEmail = await conumsByEmailPro()
  const users = await usersMatchingconumsEmailPro(mongoConseillerByEmail)

  await syncMatchingConseillersNumeriques(mongoConseillerByEmail)(
    await conumsToSync(users),
  )
  await syncMatchingCoodinateurs(mongoConseillerByEmail)(
    await coordinateursToSync(users),
  )
}
