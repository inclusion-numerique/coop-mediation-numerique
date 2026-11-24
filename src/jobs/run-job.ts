import {
  flush,
  register,
} from '@/configuration/telemetry/error-reporter/server'
import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { executeJob } from './job-executors'
import { JobValidation } from './jobs'
import { output } from './output'

const [name, donnees] = process.argv.slice(2)

const lancer = async (): Promise<number> => {
  const job = await JobValidation.safeParseAsync({
    name,
    payload: donnees ? JSON.parse(donnees) : undefined,
  })

  if (!job.success) {
    output.error(`Job invalide : ${JSON.stringify(job.error.issues)}`)
    return 1
  }

  const resultat = await executeJob(job.data)

  output.log(JSON.stringify(resultat))

  return resultat.status === 'ok' ? 0 : 1
}

register()
  .then(lancer)
  .catch((error: unknown) => {
    output.error(error)
    signaler(error)
    return 1
  })
  .then(async (code) => {
    await flush(2000)
    process.exit(code)
  })
