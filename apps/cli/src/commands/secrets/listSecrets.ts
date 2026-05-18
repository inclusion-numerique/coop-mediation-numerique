import { output } from '@app/cli/output'
import { listSecrets as configListSecrets } from '@app/config/secrets/listSecrets'
import { Command } from '@commander-js/extra-typings'

/**
 * This command outputs available secrets names
 */
export const listSecrets = new Command()
  .command('secrets:list')
  .action(async () => {
    console.log('Starting secrets:list...')
    console.log(`Fetching secrets from Secret Vault...`)
    const { secrets } = await configListSecrets()

    output(secrets.map(({ name }) => name).join('\n'))
  })
