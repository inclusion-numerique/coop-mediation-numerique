import { Command } from '@commander-js/extra-typings'
import { computeBranchNamespace } from '@/cli/branch-namespace'
import { octokit, owner, repo } from '@/cli/github/github'
import { output } from '@/libraries/console/output'

export const deactivateGithubDeployment = new Command()
  .command('github:deployment:deactivate')
  .argument('<branch>', 'branch target')
  .action(async (branch) => {
    const environment = computeBranchNamespace(branch)

    const { data: deployments } = await octokit.rest.repos.listDeployments({
      owner,
      repo,
      environment,
    })

    const deploymentIds = deployments.map(({ id }) => Number(id))

    output(
      `Found ${deploymentIds.length} deployment${
        deploymentIds.length === 1 ? '' : 's'
      } to deactivate`,
    )
    if (deploymentIds.length === 0) {
      return
    }
    output('Deactivating ...')

    await Promise.all(
      deploymentIds.map(async (deployment_id) => {
        // It is only possible to delete inactive deployments
        // First we change deployment statuses
        await octokit.rest.repos.createDeploymentStatus({
          owner,
          repo,
          deployment_id,
          state: 'inactive',
        })
      }),
    )

    output(
      `Deactivated ${deploymentIds.length} deployment${
        deploymentIds.length === 1 ? '' : 's'
      }`,
    )

    await Promise.all(
      deploymentIds.map((deployment_id) =>
        octokit.rest.repos.deleteDeployment({ owner, repo, deployment_id }),
      ),
    )

    output(
      `Deleted ${deploymentIds.length} deployment${
        deploymentIds.length === 1 ? '' : 's'
      }`,
    )
  })
