import { computeBranchNamespace, MAX_NAMESPACE_LENGTH } from './branchNamespace'

describe('computeBranchNamespace', () => {
  it('keeps a short branch name as is', () => {
    expect(computeBranchNamespace('fix/contrat-terme-futur')).toEqual(
      'fix-contrat-terme-futur',
    )
  })

  it('truncates a branch name that would overflow the uploads bucket name', () => {
    const namespace = computeBranchNamespace('fix/contrat-en-cours-terme-futur')

    expect(namespace).toEqual('fix-contrat-en-cours-terme-fut')
    expect(namespace).toHaveLength(MAX_NAMESPACE_LENGTH)
  })

  it('never overflows the 63 characters of the uploads bucket name, its tightest resource', () => {
    const namespace = computeBranchNamespace(
      'feat/une-branche-au-nom-deraisonnablement-long-comme-il-en-existe',
    )

    expect(
      `coop-mediation-numerique-uploads-${namespace}`.length,
    ).toBeLessThanOrEqual(63)
  })

  it('removes the trailing hyphen left by the truncation', () => {
    expect(computeBranchNamespace('fix/aaaaaaaaaaaaaaaaaaaaaaaaa-bb')).toEqual(
      'fix-aaaaaaaaaaaaaaaaaaaaaaaaa',
    )
  })

  it('drops digits, and the hyphen they leave dangling', () => {
    expect(computeBranchNamespace('fix/issue-1836')).toEqual('fix-issue')
  })
})
