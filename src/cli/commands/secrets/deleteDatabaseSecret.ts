import { Argument, Command } from '@commander-js/extra-typings'
import { databasePasswordSecretName } from '@/cli/secrets/databasePasswordSecretName'
import { deleteSecret } from '@/cli/secrets/deleteSecret'
import { listSecrets } from '@/cli/secrets/listSecrets'
import { output } from '@/libraries/console/output'

export const deleteDatabaseSecret = new Command()
  .command('secrets:database:delete')
  .description('Delete the database password secret of a preview namespace')
  .addArgument(new Argument('<namespace>', 'Namespace of the preview'))
  .action(async (namespace) => {
    const secretName = databasePasswordSecretName(namespace)

    if (
      namespace.trim() === '' ||
      [
        databasePasswordSecretName('main'),
        databasePasswordSecretName('dev'),
      ].includes(secretName)
    ) {
      throw new Error(
        `The database password secret of "${namespace}" (${secretName}) is never deleted`,
      )
    }
    const { secrets } = await listSecrets()
    const secret = secrets.find(({ name }) => name === secretName)

    if (!secret) {
      output(`No secret ${secretName}`)
      return
    }

    await deleteSecret(secret.id)

    output(`Secret ${secretName} deleted`)
  })
