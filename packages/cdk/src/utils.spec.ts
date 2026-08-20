import {
  computeBranchNamespace,
  createPreviewSubdomain,
  MAX_NAMESPACE_LENGTH,
  namespacer,
} from './utils'

describe('utils', () => {
  describe('computeBranchNamespace', () => {
    it('Keeps a short branch name as is', () => {
      expect(computeBranchNamespace('fix/contrat-terme-futur')).toEqual(
        'fix-contrat-terme-futur',
      )
    })

    it('Truncates a branch name that would overflow the bucket name', () => {
      const namespace = computeBranchNamespace(
        'fix/contrat-en-cours-terme-futur',
      )

      expect(namespace).toEqual('fix-contrat-en-cours-terme-fut')
      expect(namespace).toHaveLength(MAX_NAMESPACE_LENGTH)
    })

    // Le bucket des téléversements est la ressource la plus contrainte : c'est
    // elle qui fixe MAX_NAMESPACE_LENGTH, et ce test la garde alignée. Il tombe
    // si le préfixe s'allonge sans que la borne suive.
    it('Never overflows the 63 characters of an S3 bucket name', () => {
      const namespace = computeBranchNamespace(
        'feat/une-branche-au-nom-deraisonnablement-long-comme-il-en-existe',
      )

      expect(
        namespacer(namespace)('coop-mediation-numerique-uploads').length,
      ).toBeLessThanOrEqual(63)
    })

    it('Removes the trailing hyphen left by the truncation', () => {
      // 30 caractères pile, le trentième étant un tiret.
      expect(
        computeBranchNamespace('fix/aaaaaaaaaaaaaaaaaaaaaaaaa-bb'),
      ).toEqual('fix-aaaaaaaaaaaaaaaaaaaaaaaaa')
    })

    it('Drops digits, and the hyphen they leave dangling', () => {
      expect(computeBranchNamespace('fix/issue-1836')).toEqual('fix-issue')
    })
  })

  describe('createPreviewSubdomain', () => {
    it('Shortens long DNS domain name', () => {
      const result = createPreviewSubdomain(
        'a-quite-long-branch-name',
        'a-very-long.subdomain.with-a-lot-of-things.dev',
      )
      expect(result.hostname).toEqual(
        'a-quite-long-bra.a-very-long.subdomain.with-a-lot-of-things.dev',
      )
      expect(result.subdomain).toEqual('a-quite-long-bra')
    })

    it('Removes trailing hyphen of long DNS domain name', () => {
      const result = createPreviewSubdomain(
        'unfortunate-how-it-is',
        'a-very-long.subdomain.with-a-lot-of-things.dev',
      )
      expect(result.hostname).toEqual(
        'unfortunate-how.a-very-long.subdomain.with-a-lot-of-things.dev',
      )
      expect(result.subdomain).toEqual('unfortunate-how')
    })

    it('No-ops short domain names', () => {
      const result = createPreviewSubdomain(
        'feat-short',
        'a-very-long.subdomain.with-a-lot-of-things.dev',
      )
      expect(result.hostname).toEqual(
        'feat-short.a-very-long.subdomain.with-a-lot-of-things.dev',
      )
      expect(result.subdomain).toEqual('feat-short')
    })
  })
})
