import { Command } from '@commander-js/extra-typings'
import { computeBranchNamespace } from '@/cli/branchNamespace'
import { octokit, owner, repo } from '@/configuration/github/github'
import { output } from '@/libraries/console/output'

export const createGithubDeployment = new Command()
  .command('github:deployment:create')
  .argument('<branch>', 'branch target')
  .action(async (branch) => {
    const environment = computeBranchNamespace(branch)
    const isMain = branch === 'main'

    const result = await octokit.rest.repos.createDeployment({
      owner,
      repo,
      auto_merge: false,
      ref: branch,
      environment,
      task: 'deploy',
      transient_environment: !isMain,
      production_environment: !!isMain,
      required_contexts: [],
    })

    if (!('id' in result.data)) {
      throw new Error(
        `Deployment creation failed: "${
          result.data.message ?? 'Unknown error'
        }"`,
      )
    }

    output(result.data.id)
  })
