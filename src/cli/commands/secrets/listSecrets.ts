import { listSecrets as configListSecrets } from '@app/web/configuration/secrets/listSecrets'
import { output } from '@app/web/libraries/console/output'
import { Command } from '@commander-js/extra-typings'

/**
 * This command outputs available secrets names
 */
export const listSecrets = new Command()
  .command('secrets:list')
  .action(async () => {
    const { secrets } = await configListSecrets()

    output(secrets.map(({ name }) => name).join('\n'))
  })
