import { checkDeploymentStatus } from '@app/web/cli/commands/deployment/checkDeploymentStatus'
import { createGithubDeployment } from '@app/web/cli/commands/github/createGithubDeployment'
import { deactivateGithubDeployment } from '@app/web/cli/commands/github/deactivateGithubDeployment'
import { updateGithubDeployment } from '@app/web/cli/commands/github/updateGithubDeployment'
import { addNextPublicVariablesToDotEnv } from '@app/web/cli/commands/infrastructure/addNextPublicVariablesToDotEnv'
import { createDotEnvFromInfrastructure } from '@app/web/cli/commands/infrastructure/createDotEnvFromInfrastructure'
import { createTfVarsFileFromEnvironment } from '@app/web/cli/commands/infrastructure/createTfVarsFileFromEnvironment'
import { deletePreviewEnvironments } from '@app/web/cli/commands/infrastructure/deletePreviewEnvironments'
import { infrastructureInventory } from '@app/web/cli/commands/infrastructure/inventory'
import { locallyRestoreLatestMainBackup } from '@app/web/cli/commands/infrastructure/locallyRestoreLatestMainBackup'
import { deleteRegistryImage } from '@app/web/cli/commands/infrastructure/registry/deleteRegistryImage'
import { pruneRegistry } from '@app/web/cli/commands/infrastructure/registry/pruneRegistry'
import { executeJobCommand } from '@app/web/cli/commands/jobs/executeJobCommand'
import { createDotEnvFromSecrets } from '@app/web/cli/commands/secrets/createDotEnvFromSecrets'
import { deleteDatabaseSecret } from '@app/web/cli/commands/secrets/deleteDatabaseSecret'
import { getDatabasePasswordSecret } from '@app/web/cli/commands/secrets/getDatabasePasswordSecret'
import { getSecretValue } from '@app/web/cli/commands/secrets/getSecretValue'
import { listSecrets } from '@app/web/cli/commands/secrets/listSecrets'
import { setupDatabaseSecret } from '@app/web/cli/commands/secrets/setupDatabaseSecret'
import { deleteSentryEnvironmentIssues } from '@app/web/cli/commands/sentry/deleteSentryEnvironmentIssues'
import { output, outputError } from '@app/web/libraries/console/output'
import { Command } from '@commander-js/extra-typings'
import * as Sentry from '@sentry/node'

const main = async () => {
  if (
    process.env.DATABASE_URL &&
    process.env.CLI_TARGET_DEPLOYMENT_DATABASE_URL === process.env.DATABASE_URL
  ) {
    output(
      `⚠️⚠️⚠️ Executing command on target deployment ${
        process.env.CLI_TARGET_DEPLOYMENT_BRANCH
      }`,
    )
    const databaseUrl = new URL(process.env.DATABASE_URL)
    output(`⚠️⚠️⚠️ Database: ${databaseUrl.hostname} ${databaseUrl.pathname}`)
    output('⚠️⚠️⚠️ You have 8 seconds to cancel')
    await new Promise((resolve) => {
      setTimeout(resolve, 8000)
    })
  }

  const program = new Command()

  program.addCommand(executeJobCommand)
  program.addCommand(listSecrets)
  program.addCommand(getSecretValue)
  program.addCommand(setupDatabaseSecret)
  program.addCommand(deleteDatabaseSecret)
  program.addCommand(getDatabasePasswordSecret)
  program.addCommand(createDotEnvFromInfrastructure)
  program.addCommand(createDotEnvFromSecrets)
  program.addCommand(addNextPublicVariablesToDotEnv)
  program.addCommand(createGithubDeployment)
  program.addCommand(updateGithubDeployment)
  program.addCommand(deactivateGithubDeployment)
  program.addCommand(createTfVarsFileFromEnvironment)
  program.addCommand(checkDeploymentStatus)
  program.addCommand(locallyRestoreLatestMainBackup)
  program.addCommand(deleteSentryEnvironmentIssues)
  program.addCommand(pruneRegistry)
  program.addCommand(deleteRegistryImage)
  program.addCommand(deletePreviewEnvironments)
  program.addCommand(infrastructureInventory)
  await program.parseAsync()
}

main().catch(async (error) => {
  Sentry.captureException(error)
  outputError(error instanceof Error ? error.message : String(error))
  await Sentry.flush(2000)
  process.exit(1)
})
