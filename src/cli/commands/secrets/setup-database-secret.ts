import { Argument, Command } from '@commander-js/extra-typings'
import { createSecret } from '@/cli/secrets/create-secret'
import { databasePasswordSecretName } from '@/cli/secrets/database-password-secret-name'
import { generateDatabasePassword } from '@/cli/secrets/generate-database-password'
import { listSecrets } from '@/cli/secrets/list-secrets'
import { output } from '@/libraries/console'

/**
 * This command creates the database secret for the namespace argument
 */
export const setupDatabaseSecret = new Command()
  .command('secrets:database:setup')
  .description(
    'This will create a new Database password if it does not already exists',
  )
  .addArgument(new Argument('<namespace>', 'Name of the preview deployment'))
  .action(async (namespace) => {
    const secretName = databasePasswordSecretName(namespace)

    const { secrets } = await listSecrets()

    const existing = secrets.find((secret) => secret.name === secretName)

    if (existing) {
      output(`Secret ${secretName} already exists. Aborting setup.`)
      return
    }

    await createSecret({
      name: secretName,
      value: generateDatabasePassword(),
      tags: ['database', namespace],
      description: `Database password for "${namespace}" instance`,
    })

    output(`Secret ${secretName} has been created successfully`)
  })
