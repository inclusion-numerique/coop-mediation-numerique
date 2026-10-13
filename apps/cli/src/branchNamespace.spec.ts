import {
  BRANCH_SUFFIX_LENGTH,
  branchSuffix,
  computeBranchNamespace,
  MAX_NAMESPACE_LENGTH,
} from './branchNamespace'

const previewDomain = 'coop-mediation-numerique.incubateur.anct.gouv.fr'

const previewSubdomain = (namespace: string) =>
  namespace.slice(0, 63 - 1 - previewDomain.length).replace(/[-_]$/, '')

describe('computeBranchNamespace', () => {
  it('keeps main and dev as they are, as their states are named after them', () => {
    expect(computeBranchNamespace('main')).toEqual('main')
    expect(computeBranchNamespace('dev')).toEqual('dev')
  })

  it('suffixes the slug of a preview branch with letters derived from the whole branch name', () => {
    expect(computeBranchNamespace('fix/lieu')).toEqual(
      `fix-lie-${branchSuffix('fix/lieu')}`,
    )
  })

  it('derives a suffix made of lowercase letters only', () => {
    expect(branchSuffix('fix/issue-1836')).toMatch(
      new RegExp(`^[a-z]{${BRANCH_SUFFIX_LENGTH}}$`),
    )
  })

  it('always gives the same namespace to the same branch', () => {
    expect(computeBranchNamespace('feat/preview')).toEqual(
      computeBranchNamespace('feat/preview'),
    )
  })

  it('separates branches that only differ by their digits', () => {
    expect(computeBranchNamespace('fix/issue-12')).not.toEqual(
      computeBranchNamespace('fix/issue-34'),
    )
  })

  it('separates branches that only differ by a slash or a hyphen', () => {
    expect(computeBranchNamespace('feat/a-b')).not.toEqual(
      computeBranchNamespace('feat/a/b'),
    )
  })

  it('separates branches that share their first characters', () => {
    expect(computeBranchNamespace('fix/garde-fous-ci')).not.toEqual(
      computeBranchNamespace('fix/garde-robes'),
    )
  })

  it('never names a preview like main or dev', () => {
    expect(computeBranchNamespace('main/')).not.toEqual('main')
    expect(computeBranchNamespace('dev1')).not.toEqual('dev')
  })

  it('truncates a long branch name and keeps its suffix', () => {
    const branch = 'feat/une-branche-au-nom-deraisonnablement-long'
    const namespace = computeBranchNamespace(branch)

    expect(namespace).toEqual(`feat-un-${branchSuffix(branch)}`)
    expect(namespace).toHaveLength(MAX_NAMESPACE_LENGTH)
  })

  it('keeps the suffix in the preview subdomain, the tightest name', () => {
    const branch =
      'feat/une-branche-au-nom-deraisonnablement-long-comme-il-en-existe'
    const namespace = computeBranchNamespace(branch)

    expect(previewSubdomain(namespace)).toEqual(namespace)
    expect(namespace.endsWith(branchSuffix(branch))).toBe(true)
  })

  it('never overflows the 63 characters of the uploads bucket name', () => {
    expect(
      `coop-mediation-numerique-uploads-${computeBranchNamespace('feat/une-branche-au-nom-deraisonnablement-long')}`
        .length,
    ).toBeLessThanOrEqual(63)
  })

  it('removes the trailing hyphen left by the truncation', () => {
    const branch = 'fix/ab-cd'

    expect(computeBranchNamespace(branch)).toEqual(
      `fix-ab-${branchSuffix(branch)}`,
    )
  })

  it('drops digits, and the hyphen they leave dangling', () => {
    expect(computeBranchNamespace('fix/a-12')).toEqual(
      `fix-a-${branchSuffix('fix/a-12')}`,
    )
  })

  it('replaces dots, at signs and underscores with hyphens', () => {
    const branch = 'Dep_n@x'

    expect(computeBranchNamespace(branch)).toEqual(
      `dep-n-x-${branchSuffix(branch)}`,
    )
  })

  it('falls back on the suffix alone when the branch has no letter', () => {
    expect(computeBranchNamespace('1234')).toEqual(branchSuffix('1234'))
  })
})
