import { computeBranchNamespace } from '@app/cdk/utils'
import { output, outputError } from '@app/cli/output'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { Command } from '@commander-js/extra-typings'
import {
  createSentryHttpClient,
  deleteIssuesByIds,
  listEnvironmentsWithIssues,
  listIssueIdsForEnvironment,
  listProjectEnvironments,
  type SentryConfig,
  updateProjectEnvironmentVisibility,
} from './sentry-utils'

export const deleteSentryEnvironmentIssues = new Command()
  .command('sentry:delete-environment-issues')
  .argument('<environment>', 'environment')
  .action(async (environmentArgument) => {
    const environment = computeBranchNamespace(environmentArgument)
    if (environment === 'main') {
      output('You are trying to delete issues for the main environment')
      output('This is not allowed')
      process.exit(1)
      return
    }

    const config: SentryConfig = {
      url: ServerWebAppConfig.Sentry.url,
      org: ServerWebAppConfig.Sentry.org,
      project: ServerWebAppConfig.Sentry.project,
      authToken: ServerWebAppConfig.Sentry.authToken,
    }
    const http = createSentryHttpClient(config)

    // First, list all environments that currently have issues
    const envsWithIssues = await listEnvironmentsWithIssues(
      http,
      config.org,
      config.project,
    )
    const allEnvs = await listProjectEnvironments(
      http,
      config.org,
      config.project,
    )
    const envWithCount = new Map(
      envsWithIssues.map((e) => [e.environment, e.count]),
    )
    const zeroEnvs = allEnvs.filter((e) => !envWithCount.has(e))

    if (envsWithIssues.length > 0) {
      output('Environments with issues:')
      for (const e of envsWithIssues) output(`- ${e.environment}: ${e.count}`)
    } else {
      output('No environments with issues found in Sentry')
    }

    if (zeroEnvs.length > 0) {
      output('Environments with 0 issues:')
      for (const name of zeroEnvs) output(`- ${name}`)
    }

    output(
      `Fetching issues in Sentry environment "${environment}" for project ${config.org}/${config.project}...`,
    )
    const issueIds = await listIssueIdsForEnvironment(
      http,
      config.org,
      config.project,
      environment,
    )
    output(`Found ${issueIds.length} issue(s) to delete`)

    if (issueIds.length > 0) {
      output('Deleting issues...')
      const { deletedCount, failedCount } = await deleteIssuesByIds(
        http,
        issueIds,
      )
      output(`Deleted ${deletedCount} issue(s)`)
      if (failedCount > 0)
        outputError(`Failed to delete ${failedCount} issue(s)`)
    }

    output(
      'Note: Hiding environments must be done manually in the Sentry UI; no public API is available.',
    )

    try {
      const result = await updateProjectEnvironmentVisibility(
        http,
        config.org,
        config.project,
        environment,
        true,
      )
      output(`Environment "${result.name}" has been hidden from Sentry UI`)
    } catch {
      outputError('Failed to hide environment via Sentry API')
    }
  })
