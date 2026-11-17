import { appendEnvVariablesToDotEnvFile } from '@app/web/cli/dotEnvFile'
import { getSecretValue } from '@app/web/configuration/secrets/getSecretValue'
import { listSecrets } from '@app/web/configuration/secrets/listSecrets'
import { output } from '@app/web/libraries/console/output'
import { Command } from '@commander-js/extra-typings'

/**
 * This command fetches secrets from Secret Vault using scaleway keys and put them into .env
 */
export const createDotEnvFromSecrets = new Command()
  .command('dotenv:from-secrets')
  .action(async () => {
    const list = await listSecrets()

    const environmentVariables = await Promise.all(
      list.secrets.map(async ({ name, id }) => {
        const value = await getSecretValue({ id })
        return { name, value }
      }),
    )

    await appendEnvVariablesToDotEnvFile({
      comment: 'Secrets variables',
      environmentVariables,
    })

    output(`${environmentVariables.length} secrets added to .env file`)
  })
