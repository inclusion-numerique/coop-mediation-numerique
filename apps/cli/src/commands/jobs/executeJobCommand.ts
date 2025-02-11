// eslint-disable-next-line unicorn/prevent-abbreviations
import { Argument, Command } from '@commander-js/extra-typings'
import { JobValidation } from '@app/web/jobs/jobs'
import { executeJob, jobExecutors } from '@app/web/jobs/jobExecutors'
import { closeMongoClient } from '@app/web/external-apis/conseiller-numerique/conseillerNumeriqueMongoClient'
import { output } from '@app/cli/output'
import {
  configureDeploymentTarget,
  DeploymentTargetOption,
} from '@app/cli/deploymentTarget'

const cleanupAfterJob = async () => {
  await closeMongoClient()
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export const executeJobCommand = new Command()
  .command('job:execute')
  .addArgument(
    new Argument('<name>', 'Job name').choices(Object.keys(jobExecutors)),
  )
  .addArgument(new Argument('[data]', 'Job data'))
  .addOption(DeploymentTargetOption)
  .action(async (name, dataAsString, options) => {
    await configureDeploymentTarget(options)
    const data: unknown = dataAsString ? JSON.parse(dataAsString) : undefined

    const jobPayload = await JobValidation.safeParseAsync({
      name,
      data,
    })

    if (!jobPayload.success) {
      output('Invalid job payload')
      output(JSON.stringify(jobPayload.error, null, 2))

      process.exit(1)
      return
    }

    const result = await executeJob(jobPayload.data)

    if (result.error) {
      output('Job failed')
      output(result.error.message)
      output(result.error.stack)
      await cleanupAfterJob()
      process.exit(1)
      return
    }
    output('Job executed successfully')
    output(JSON.stringify(result, null, 2))
    await cleanupAfterJob()
  })
