import { output } from '@app/cli/output'
import { createSecret } from '@app/web/configuration/secrets/createSecret'
import { databasePasswordSecretName } from '@app/web/configuration/secrets/databasePasswordSecretName'
import { generateDatabasePassword } from '@app/web/configuration/secrets/generateDatabasePassword'
import { listSecrets } from '@app/web/configuration/secrets/listSecrets'
import { Argument, Command } from '@commander-js/extra-typings'

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
