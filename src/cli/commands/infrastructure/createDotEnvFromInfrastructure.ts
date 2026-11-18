import { Command } from '@commander-js/extra-typings'
import { appendEnvVariablesToDotEnvFile } from '@/cli/dotEnvFile'
import { output } from '@/libraries/console/output'
import { readInfrastructureOutput } from './infrastructureOutput'

export const createDotEnvFromInfrastructure = new Command()
  .command('dotenv:from-infrastructure')
  .description('Add the infrastructure outputs to the .env file')
  .action(async () => {
    const { databaseUrl, webBaseUrl } = await readInfrastructureOutput()

    await appendEnvVariablesToDotEnvFile({
      comment: 'From infrastructure outputs',
      environmentVariables: [
        { name: 'DATABASE_URL', value: databaseUrl },
        { name: 'WEB_BASE_URL', value: webBaseUrl },
      ],
    })

    output('Added infrastructure outputs to .env file')
  })
