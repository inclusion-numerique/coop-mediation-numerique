import { initializeSentry } from '@app/web/sentry'
import * as Sentry from '@sentry/nextjs'
import { executeJob } from './jobExecutors'
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

initializeSentry()

lancer()
  .catch((error: unknown) => {
    output.error(error)
    Sentry.captureException?.(error)
    return 1
  })
  .then(async (code) => {
    await Sentry.flush?.(2000)
    process.exit(code)
  })
