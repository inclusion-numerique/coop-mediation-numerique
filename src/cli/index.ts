import { Command } from '@commander-js/extra-typings'
import { checkDeploymentStatus } from '@/cli/commands/deployment/check-deployment-status'
import { deactivateGithubDeployment } from '@/cli/commands/github/deactivate-github-deployment'
import { addNextPublicVariablesToDotEnv } from '@/cli/commands/infrastructure/add-next-public-variables-to-dot-env'
import { createDotEnvFromInfrastructure } from '@/cli/commands/infrastructure/create-dot-env-from-infrastructure'
import { createTfVarsFileFromEnvironment } from '@/cli/commands/infrastructure/create-tf-vars-file-from-environment'
import { locallyRestoreLatestMainBackup } from '@/cli/commands/infrastructure/locally-restore-latest-main-backup'
import { deleteRegistryImage } from '@/cli/commands/infrastructure/registry/delete-registry-image'
import { pruneRegistry } from '@/cli/commands/infrastructure/registry/prune-registry'
import { createDotEnvFromSecrets } from '@/cli/commands/secrets/create-dot-env-from-secrets'
import { deleteDatabaseSecret } from '@/cli/commands/secrets/delete-database-secret'
import { getDatabasePasswordSecret } from '@/cli/commands/secrets/get-database-password-secret'
import { setupDatabaseSecret } from '@/cli/commands/secrets/setup-database-secret'
import { deleteSentryEnvironmentIssues } from '@/cli/commands/sentry/delete-sentry-environment-issues'
import { outputError } from '@/libraries/console'

const main = async () => {
  const program = new Command()

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

main().catch((error) => {
  outputError(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
