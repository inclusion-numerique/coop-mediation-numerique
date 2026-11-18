import { Argument, Command } from '@commander-js/extra-typings'
import {
  configureDeploymentTarget,
  DeploymentTargetOption,
} from '@/cli/deploymentTarget'
import { executeJob, jobExecutors } from '@/jobs/jobExecutors'
import { JobValidation } from '@/jobs/jobs'
import { output } from '@/libraries/console/output'

export const executeJobCommand = new Command()
  .command('job:execute')
  .addArgument(
    new Argument('<name>', 'Job name').choices(Object.keys(jobExecutors)),
  )
  .addArgument(new Argument('[data]', 'Job data'))
  .addOption(DeploymentTargetOption)
  .action(async (name, dataAsString, options) => {
    await configureDeploymentTarget(options)
    const payload: unknown = dataAsString ? JSON.parse(dataAsString) : undefined

    const jobPayload = await JobValidation.safeParseAsync({
      name,
      payload,
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
      process.exit(1)
      return
    }
    output('Job executed successfully')
    output(JSON.stringify(result, null, 2))
  })
