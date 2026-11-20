import { Command } from '@commander-js/extra-typings'
import * as Sentry from '@sentry/node'
import { checkDeploymentStatus } from '@/cli/commands/deployment/checkDeploymentStatus'
import { deactivateGithubDeployment } from '@/cli/commands/github/deactivateGithubDeployment'
import { addNextPublicVariablesToDotEnv } from '@/cli/commands/infrastructure/addNextPublicVariablesToDotEnv'
import { createDotEnvFromInfrastructure } from '@/cli/commands/infrastructure/createDotEnvFromInfrastructure'
import { createTfVarsFileFromEnvironment } from '@/cli/commands/infrastructure/createTfVarsFileFromEnvironment'
import { locallyRestoreLatestMainBackup } from '@/cli/commands/infrastructure/locallyRestoreLatestMainBackup'
import { deleteRegistryImage } from '@/cli/commands/infrastructure/registry/deleteRegistryImage'
import { pruneRegistry } from '@/cli/commands/infrastructure/registry/pruneRegistry'
import { executeJobCommand } from '@/cli/commands/jobs/executeJobCommand'
import { createDotEnvFromSecrets } from '@/cli/commands/secrets/createDotEnvFromSecrets'
import { deleteDatabaseSecret } from '@/cli/commands/secrets/deleteDatabaseSecret'
import { getDatabasePasswordSecret } from '@/cli/commands/secrets/getDatabasePasswordSecret'
import { setupDatabaseSecret } from '@/cli/commands/secrets/setupDatabaseSecret'
import { deleteSentryEnvironmentIssues } from '@/cli/commands/sentry/deleteSentryEnvironmentIssues'
import { outputError } from '@/libraries/console/output'

const main = async () => {
  const program = new Command()

  program.addCommand(executeJobCommand)
  program.addCommand(setupDatabaseSecret)
  program.addCommand(deleteDatabaseSecret)
  program.addCommand(getDatabasePasswordSecret)
  program.addCommand(createDotEnvFromInfrastructure)
  program.addCommand(createDotEnvFromSecrets)
  program.addCommand(addNextPublicVariablesToDotEnv)
  program.addCommand(deactivateGithubDeployment)
  program.addCommand(createTfVarsFileFromEnvironment)
  program.addCommand(checkDeploymentStatus)
  program.addCommand(locallyRestoreLatestMainBackup)
  program.addCommand(deleteSentryEnvironmentIssues)
  program.addCommand(pruneRegistry)
  program.addCommand(deleteRegistryImage)
  await program.parseAsync()
}

main().catch(async (error) => {
  Sentry.captureException(error)
  outputError(error instanceof Error ? error.message : String(error))
  await Sentry.flush(2000)
  process.exit(1)
})
