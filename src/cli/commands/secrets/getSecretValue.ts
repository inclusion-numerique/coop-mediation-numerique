import { Argument, Command } from '@commander-js/extra-typings'
import { findSecretByName } from '@/cli/secrets/findSecretByName'
import { getSecretValue as configGetSecretValue } from '@/cli/secrets/getSecretValue'
import { listSecrets } from '@/cli/secrets/listSecrets'
import { output } from '@/libraries/console/output'

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
