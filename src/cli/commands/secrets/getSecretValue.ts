import { findSecretByName } from '@app/web/configuration/secrets/findSecretByName'
import { getSecretValue as configGetSecretValue } from '@app/web/configuration/secrets/getSecretValue'
import { listSecrets } from '@app/web/configuration/secrets/listSecrets'
import { output } from '@app/web/libraries/console/output'
import { Argument, Command } from '@commander-js/extra-typings'

/**
 * This command outputs available secrets names
 */
export const getSecretValue = new Command()
  .command('secrets:get')
  .addArgument(new Argument('<name>', 'Name of the secret'))
  .action(async (name) => {
    const { secrets } = await listSecrets()
    const { id } = findSecretByName(secrets, name)
    const value = await configGetSecretValue({ id })

    output(value)
  })
