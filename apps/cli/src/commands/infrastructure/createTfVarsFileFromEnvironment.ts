import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { output } from '@app/cli/output'
import { getDirname } from '@app/config/dirname'
import { Argument, Command } from '@commander-js/extra-typings'

const {
  webAppStackVariables,
  webAppStackSensitiveVariables,
  webAppStackEntrepotVariables,
  webAppStackEntrepotSensitiveVariables,
} = await import('@app/cdk/WebAppStack')

// See https://developer.hashicorp.com/terraform/language/values/variables#variable-definitions-tfvars-files
export const createTfVarsFileFromEnvironment = new Command()
  .command('terraform:vars-from-env')
  .addArgument(new Argument('<stack>', 'CDK Stack').choices(['web']))
  .action(async (stack) => {
    const requiredNames =
      stack === 'web'
        ? [...webAppStackVariables, ...webAppStackSensitiveVariables]
        : null

    if (!requiredNames) {
      throw new Error('Invalid stack argument')
    }

    // Optional variables (e.g. the entrepôt SSH tunnel) are emitted only when set; otherwise the
    // CDK default ('') applies, so they never block a deployment that hasn't configured them yet.
    const optionalNames = [
      ...webAppStackEntrepotVariables,
      ...webAppStackEntrepotSensitiveVariables,
    ]

    const requiredVariables = requiredNames.map((name) => {
      const value = process.env[name]
      if (!value) {
        throw new Error(
          `Variable ${name} is not present in environment but needed as a terraform variable for "${stack}" stack`,
        )
      }
      return [name, value] as const
    })

    const optionalVariables = optionalNames
      .map((name) => [name, process.env[name]] as const)
      .filter(([, value]) => Boolean(value))

    const variables = Object.fromEntries([
      ...requiredVariables,
      ...optionalVariables,
    ])

    const tfVariablesFile = path.resolve(
      getDirname(import.meta.url),
      '../../../../../packages/cdk/.tfvars.json',
    )
    await writeFile(tfVariablesFile, JSON.stringify(variables, null, 2))

    output(
      `The ${Object.keys(variables).length} terraform variables for stack ${stack} have been added to ${tfVariablesFile}`,
    )
  })
