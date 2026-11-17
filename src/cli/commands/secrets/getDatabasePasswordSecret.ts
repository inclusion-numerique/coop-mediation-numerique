import { databasePasswordSecretName } from '@app/web/configuration/secrets/databasePasswordSecretName'
import { findSecretByName } from '@app/web/configuration/secrets/findSecretByName'
import { getSecretValue as configGetSecretValue } from '@app/web/configuration/secrets/getSecretValue'
import { listSecrets } from '@app/web/configuration/secrets/listSecrets'
import { output } from '@app/web/libraries/console/output'
import { Argument, Command } from '@commander-js/extra-typings'

/**
 * This command outputs available secrets names
 */
export const getDatabasePasswordSecret = new Command()
  .command('secrets:database-password')
  .addArgument(
    new Argument('<namespace>', 'Namespace of the target deployment'),
  )
  .action(async (namespace) => {
    const secretName = databasePasswordSecretName(namespace)

    const { secrets } = await listSecrets()
    const { id } = findSecretByName(secrets, secretName)
    const value = await configGetSecretValue({ id })

    output(value)
  })
