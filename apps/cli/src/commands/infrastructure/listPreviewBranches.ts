import { octokit, owner, repo } from '@app/cli/github'
import { output, outputError } from '@app/cli/output'
import { containerNamespaceName, region } from '@app/config/config'
import { Command } from '@commander-js/extra-typings'
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

  // Find the namespace ID by name
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

const fetchAllBranches = async () => {
  const { data } = await octokit.rest.repos.listBranches({
    owner,
    repo,
    per_page: 100,
  })
  return data
}

const fetchOpenPullRequests = async () => {
  const { data } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: 'open',
    per_page: 100,
  })
  return data
}

export const listPreviewBranches = new Command()
  .command('infrastructure:list-branches')
  .description(
    'List remote branches with protection status, open PRs, Scaleway deployment, and commit dates',
  )
  .action(async () => {
    output('Fetching branches, pull requests, and Scaleway containers...\n')

    const [branches, openPRs, containers] = await Promise.all([
      fetchAllBranches(),
      fetchOpenPullRequests(),
      fetchScalewayContainers(),
    ])

    const prByBranch = new Map(openPRs.map((pr) => [pr.head.ref, pr]))

    // Map container names to container objects for lookup
    const containerByName = new Map(
      containers.map((container) => [container.name, container]),
    )

    // Build a set of all branch namespaces that exist in git
    const branchNamespaceToGitBranch = new Map<string, string>()

    // Fetch commit details and compare with dev for all branches
    const branchDetails = await Promise.all(
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

        // Check if all commits are already in dev (ahead_by === 0 means fully merged)
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

    // Find orphaned containers (deployed but no git branch)
    const orphanedContainers = containers.filter(
      (container) => !branchNamespaceToGitBranch.has(container.name),
    )

    // Sort: protected first, then by last commit date (oldest first)
    branchDetails.sort((a, b) => {
      if (a.isProtected !== b.isProtected) return a.isProtected ? -1 : 1
      return (
        new Date(a.lastCommitDate).getTime() -
        new Date(b.lastCommitDate).getTime()
      )
    })

    output(
      `Found ${branches.length} branches, ${containers.length} deployed containers\n`,
    )

    // Protected branches table
    const protectedTable = new Table({
      head: ['Branch', 'Deployed', 'PR', 'Last Commit'],
    })
    for (const branch of branchDetails.filter((b) => b.isProtected)) {
      protectedTable.push([
        branch.name,
        branch.deployed ? 'Yes' : 'No',
        branch.pr ? `#${branch.pr.number}` : '-',
        branch.lastCommitDate !== 'unknown'
          ? formatDate(branch.lastCommitDate)
          : '-',
      ])
    }
    output('PROTECTED BRANCHES:')
    output(protectedTable.toString())

    // Other branches table
    const branchesTable = new Table({
      head: [
        'Branch',
        'Deployed',
        'PR',
        'Merged in dev',
        'Last Commit',
        'Stale',
        'Deletable',
      ],
    })
    for (const branch of branchDetails.filter((b) => !b.isProtected)) {
      const days = daysAgo(branch.lastCommitDate)
      const prCell = branch.pr
        ? `#${branch.pr.number}\n${branch.pr.title}\nopened ${formatDate(branch.pr.createdAt)}`
        : '-'

      branchesTable.push([
        branch.name,
        branch.deployed ? 'Yes' : 'No',
        prCell,
        branch.mergedInDev ? 'Yes' : 'No',
        branch.lastCommitDate !== 'unknown'
          ? `${formatDate(branch.lastCommitDate)}\n(${days}d ago)`
          : '-',
        branch.stale ? 'Yes' : 'No',
        branch.deletable ? 'Yes' : '-',
      ])
    }
    output('\nBRANCHES:')
    output(branchesTable.toString())

    // Orphaned containers table
    if (orphanedContainers.length > 0) {
      const orphanedTable = new Table({
        head: ['Container Name', 'Status', 'Created', 'Deletable'],
      })
      for (const container of orphanedContainers) {
        orphanedTable.push([
          container.name,
          container.status,
          formatDate(container.created_at),
          'Yes',
        ])
      }
      output('\nORPHANED CONTAINERS (deployed without git branch):')
      output(orphanedTable.toString())
    }

    // Summary table
    const otherBranches = branchDetails.filter((b) => !b.isProtected)
    const withPR = otherBranches.filter((b) => b.pr).length
    const withoutPR = otherBranches.filter((b) => !b.pr).length
    const staleCount = otherBranches.filter((b) => b.stale).length
    const mergedCount = otherBranches.filter((b) => b.mergedInDev).length
    const deletableCount = otherBranches.filter((b) => b.deletable).length
    const deployedCount = branchDetails.filter((b) => b.deployed).length

    const summaryTable = new Table()
    summaryTable.push(
      {
        Protected: `${branchDetails.filter((b) => b.isProtected).length} (${protectedBranches.join(', ')})`,
      },
      { 'With open PR': String(withPR) },
      { 'Without open PR': String(withoutPR) },
      { 'Merged in dev': String(mergedCount) },
      { 'Deployed on Scaleway': String(deployedCount) },
      { 'Orphaned containers': String(orphanedContainers.length) },
      { 'Stale (>30 days)': String(staleCount) },
      { Deletable: String(deletableCount + orphanedContainers.length) },
      { 'Total branches': String(branches.length) },
    )
    output('\nSUMMARY:')
    output(summaryTable.toString())
  })
