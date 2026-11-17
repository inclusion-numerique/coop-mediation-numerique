import { Argument, Command } from '@commander-js/extra-typings'
import { databasePasswordSecretName } from '@/configuration/secrets/databasePasswordSecretName'
import { findSecretByName } from '@/configuration/secrets/findSecretByName'
import { getSecretValue as configGetSecretValue } from '@/configuration/secrets/getSecretValue'
import { listSecrets } from '@/configuration/secrets/listSecrets'
import { output } from '@/libraries/console/output'

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
