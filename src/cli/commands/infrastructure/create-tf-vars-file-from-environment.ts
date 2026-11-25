import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Command } from '@commander-js/extra-typings'
import { getDirname } from '@/libraries/chemins'
import { output } from '@/libraries/console'
import {
  optionalInfrastructureVariables,
  requiredInfrastructureVariables,
} from './infrastructure-variables'

const infrastructureVariablesFile = path.resolve(
  getDirname(import.meta.url),
  '../../../../infrastructure/.tfvars.json',
)

export const createTfVarsFileFromEnvironment = new Command()
  .command('infrastructure:vars-from-env')
  .description(
    'Write the OpenTofu variables of the infrastructure from the environment',
  )
  .action(async () => {
    const missing = requiredInfrastructureVariables.filter(
      (name) => !process.env[name],
    )

    if (missing.length > 0) {
      throw new Error(
        `Variables missing from the environment but needed by the infrastructure: ${missing.join(', ')}`,
      )
    }

    const variables = Object.fromEntries(
      [...requiredInfrastructureVariables, ...optionalInfrastructureVariables]
        .map((name) => [name, process.env[name]] as const)
        .filter(([, value]) => Boolean(value)),
    )

    await writeFile(
      infrastructureVariablesFile,
      JSON.stringify(variables, null, 2),
    )

    output(
      `${Object.keys(variables).length} infrastructure variables written to ${infrastructureVariablesFile}`,
    )
  })
