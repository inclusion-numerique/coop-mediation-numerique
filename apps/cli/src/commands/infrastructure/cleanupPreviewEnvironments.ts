import { octokit, owner, repo } from '@app/cli/github'
import { output, outputError } from '@app/cli/output'
import { containerNamespaceName, projectSlug, region } from '@app/config/config'
import { Command } from '@commander-js/extra-typings'
import { select } from '@inquirer/prompts'
import axios from 'axios'
import Table from 'cli-table3'
import { differenceInDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'

const { computeBranchNamespace } = await import('@app/cdk/utils')

const protectedBranches = ['main', 'dev']

const formatDate = (dateString: string) =>
  format(new Date(dateString), "dd/MM/yyyy HH'h'mm", { locale: fr })

const daysAgo = (dateString: string) =>
  differenceInDays(new Date(), new Date(dateString))

type ScalewayContainer = {
  id: string
  name: string
  namespace_id: string
  status: string
  domain_name: string
  created_at: string
  updated_at: string
}

type ScalewayNamespace = {
  id: string
  name: string
}

const fetchScalewayContainers = async () => {
  const secretKey = process.env.SCW_SECRET_KEY
  if (!secretKey) {
    outputError(
      'Missing SCW_SECRET_KEY env variable, skipping Scaleway containers check',
    )
    return []
  }

  const scwRegion = region || 'fr-par'
  const client = axios.create({
    baseURL: `https://api.scaleway.com/containers/v1beta1/regions/${scwRegion}`,
    headers: { 'X-Auth-Token': secretKey },
  })

  const { data: namespacesData } = await client.get<{
    namespaces: ScalewayNamespace[]
  }>('/namespaces', {
    params: { name: containerNamespaceName, page_size: 100 },
  })

  const namespace = namespacesData.namespaces.find(
    (ns) => ns.name === containerNamespaceName,
  )

  if (!namespace) {
    outputError(
      `Scaleway namespace "${containerNamespaceName}" not found, skipping containers check`,
    )
    return []
  }

  const { data: containersData } = await client.get<{
    containers: ScalewayContainer[]
  }>('/containers', {
    params: { namespace_id: namespace.id, page_size: 100 },
  })

  return containersData.containers
}

const triggerEnvDeletion = async (
  branch: string,
  circleCiToken: string,
): Promise<boolean> => {
  const circleCiApiUrl = `https://circleci.com/api/v2/project/gh/inclusion-numerique/${projectSlug}/pipeline`

  try {
    const response = await axios.post(
      circleCiApiUrl,
      {
        branch: 'dev',
        parameters: {
          trigger_workflow: 'web_app_preview_deletion',
          preview_deletion_branch: branch,
        },
      },
      {
        headers: {
          'Circle-Token': circleCiToken,
          'Content-Type': 'application/json',
        },
      },
    )
    const pipelineUrl = `https://app.circleci.com/pipelines/github/inclusion-numerique/${projectSlug}/${response.data.number}`
    output(`  Env deletion pipeline triggered: ${pipelineUrl}`)
    return true
  } catch (error) {
    if (axios.isAxiosError(error)) {
      outputError(
        `  Env deletion failed: ${error.response?.status} ${error.response?.statusText ?? ''} - ${JSON.stringify(error.response?.data)}`,
      )
    } else {
      outputError(
        `  Env deletion failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
    return false
  }
}

const deleteGitBranch = async (branch: string): Promise<boolean> => {
  try {
    await octokit.rest.git.deleteRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    })
    output(`  Git branch "${branch}" deleted`)
    return true
  } catch (error) {
    outputError(
      `  Failed to delete git branch "${branch}": ${error instanceof Error ? error.message : String(error)}`,
    )
    return false
  }
}

type BranchDetail = {
  name: string
  isProtected: boolean
  pr: { number: number; title: string; createdAt: string } | null
  lastCommitDate: string
  lastCommitAuthor: string
  deployed: boolean
  stale: boolean
  mergedInDev: boolean
  deletable: boolean
}

type CleanupAction = 'env_and_branch' | 'env_only' | 'branch_only' | 'skip'

export const cleanupPreviewEnvironments = new Command()
  .command('infrastructure:cleanup-preview')
  .description(
    'Interactive cleanup: review each deletable branch, delete its preview environment and/or git branch',
  )
  .action(async () => {
    const circleCiToken = process.env.CIRCLE_CI_TOKEN
    if (!circleCiToken) {
      outputError(
        'Missing CIRCLE_CI_TOKEN env variable for CircleCI authentication',
      )
      process.exit(1)
      return
    }

    output('Fetching branches, pull requests, and Scaleway containers...\n')

    const [branches, openPRs, containers] = await Promise.all([
      octokit.rest.repos
        .listBranches({ owner, repo, per_page: 100 })
        .then((r) => r.data),
      octokit.rest.pulls
        .list({ owner, repo, state: 'open', per_page: 100 })
        .then((r) => r.data),
      fetchScalewayContainers(),
    ])

    const prByBranch = new Map(openPRs.map((pr) => [pr.head.ref, pr]))
    const containerByName = new Map(containers.map((c) => [c.name, c]))
    const branchNamespaceToGitBranch = new Map<string, string>()

    const branchDetails: BranchDetail[] = await Promise.all(
      branches.map(async (branch) => {
        const { data: commit } = await octokit.rest.repos.getCommit({
          owner,
          repo,
          ref: branch.commit.sha,
        })

        const lastCommitDate =
          commit.commit.committer?.date ??
          commit.commit.author?.date ??
          'unknown'

        const pr = prByBranch.get(branch.name)
        const namespace = computeBranchNamespace(branch.name)
        const containerName =
          namespace.length > 34 ? namespace.slice(0, 34) : namespace

        branchNamespaceToGitBranch.set(containerName, branch.name)

        const deployed = containerByName.has(containerName)
        const isProtected = protectedBranches.includes(branch.name)
        const days = lastCommitDate !== 'unknown' ? daysAgo(lastCommitDate) : 0
        const stale = days > 30

        let mergedInDev = false
        if (!isProtected) {
          try {
            const { data: comparison } =
              await octokit.rest.repos.compareCommits({
                owner,
                repo,
                base: 'dev',
                head: branch.name,
              })
            mergedInDev = comparison.ahead_by === 0
          } catch {
            // If comparison fails, assume not merged
          }
        }

        const deletable =
          !isProtected && ((!pr && stale) || (!pr && mergedInDev))

        return {
          name: branch.name,
          isProtected,
          pr: pr
            ? { number: pr.number, title: pr.title, createdAt: pr.created_at }
            : null,
          lastCommitDate,
          lastCommitAuthor:
            commit.commit.author?.name ?? commit.author?.login ?? 'unknown',
          deployed,
          stale,
          mergedInDev,
          deletable,
        }
      }),
    )

    const orphanedContainers = containers.filter(
      (c) => !branchNamespaceToGitBranch.has(c.name),
    )

    // Sort: oldest first for review
    branchDetails.sort(
      (a, b) =>
        new Date(a.lastCommitDate).getTime() -
        new Date(b.lastCommitDate).getTime(),
    )

    const nonProtected = branchDetails.filter((b) => !b.isProtected)
    const deletable = nonProtected.filter((b) => b.deletable)

    // Overview
    const overviewTable = new Table()
    overviewTable.push(
      { 'Total branches': String(branches.length) },
      {
        Protected: `${branchDetails.filter((b) => b.isProtected).length} (${protectedBranches.join(', ')})`,
      },
      { 'With open PR': String(nonProtected.filter((b) => b.pr).length) },
      { Deletable: String(deletable.length) },
      { 'Orphaned containers': String(orphanedContainers.length) },
    )
    output('OVERVIEW:')
    output(overviewTable.toString())

    if (deletable.length === 0 && orphanedContainers.length === 0) {
      output('\nNothing to clean up.')
      return
    }

    output(
      `\nReviewing ${deletable.length} deletable branch(es) and ${orphanedContainers.length} orphaned container(s)...\n`,
    )

    let envDeletedCount = 0
    let branchDeletedCount = 0
    let skippedCount = 0

    // Iterate through deletable branches
    for (const [index, branch] of deletable.entries()) {
      const days = daysAgo(branch.lastCommitDate)

      const statusTable = new Table()
      statusTable.push(
        { Branch: branch.name },
        { Deployed: branch.deployed ? 'Yes' : 'No' },
        { 'Merged in dev': branch.mergedInDev ? 'Yes' : 'No' },
        { Stale: branch.stale ? `Yes (${days}d ago)` : 'No' },
        {
          'Last commit': `${branch.lastCommitDate !== 'unknown' ? formatDate(branch.lastCommitDate) : '-'} by ${branch.lastCommitAuthor}`,
        },
      )

      output(`\n--- Branch ${index + 1}/${deletable.length} ---`)
      output(statusTable.toString())

      const choices: { name: string; value: CleanupAction }[] = branch.deployed
        ? [
            {
              name: 'Delete environment + git branch',
              value: 'env_and_branch',
            },
            { name: 'Delete environment only', value: 'env_only' },
            { name: 'Delete git branch only', value: 'branch_only' },
            { name: 'Do nothing', value: 'skip' },
          ]
        : [
            { name: 'Delete git branch', value: 'branch_only' },
            { name: 'Do nothing', value: 'skip' },
          ]

      const defaultAction: CleanupAction = branch.deployed
        ? branch.mergedInDev
          ? 'env_and_branch'
          : 'skip'
        : branch.mergedInDev
          ? 'branch_only'
          : 'skip'

      const action = await select<CleanupAction>({
        message: `What to do with "${branch.name}"?`,
        default: defaultAction,
        choices,
      })

      if (action === 'skip') {
        output('  Skipped.')
        skippedCount++
        continue
      }

      if (action === 'env_and_branch' || action === 'env_only') {
        output(`  Triggering environment deletion for "${branch.name}"...`)
        const success = await triggerEnvDeletion(branch.name, circleCiToken)
        if (success) envDeletedCount++
      }

      if (action === 'env_and_branch' || action === 'branch_only') {
        output(`  Deleting git branch "${branch.name}"...`)
        const success = await deleteGitBranch(branch.name)
        if (success) branchDeletedCount++
      }
    }

    // Iterate through orphaned containers (no git branch to delete)
    for (const [index, container] of orphanedContainers.entries()) {
      const statusTable = new Table()
      statusTable.push(
        { 'Container name': container.name },
        { Status: container.status },
        { Created: formatDate(container.created_at) },
        { 'Git branch': 'None (orphaned)' },
      )

      output(
        `\n--- Orphaned container ${index + 1}/${orphanedContainers.length} ---`,
      )
      output(statusTable.toString())

      const action = await select<'env_only' | 'skip'>({
        message: `What to do with orphaned container "${container.name}"?`,
        default: 'env_only',
        choices: [
          {
            name: 'Delete environment',
            value: 'env_only',
          },
          {
            name: 'Do nothing',
            value: 'skip',
          },
        ],
      })

      if (action === 'env_only') {
        output(`  Triggering environment deletion for "${container.name}"...`)
        const success = await triggerEnvDeletion(container.name, circleCiToken)
        if (success) envDeletedCount++
      } else {
        output('  Skipped.')
        skippedCount++
      }
    }

    // Final summary
    output('')
    const summaryTable = new Table()
    summaryTable.push(
      { 'Env deletions triggered': String(envDeletedCount) },
      { 'Git branches deleted': String(branchDeletedCount) },
      { Skipped: String(skippedCount) },
    )
    output('CLEANUP COMPLETE:')
    output(summaryTable.toString())
  })
