import { executeBraveWebSearch } from '@app/web/assistant/tools/brave/braveSearch'

describe('braveSearch', () => {
  it('should return a list of results', async () => {
    const results = await executeBraveWebSearch({
      q: 'les bases du numérique d’intéret géneral',
      count: 20,
    })

    expect(results).toHaveLength(20)

    const found = results.find((result) =>
      result.url.startsWith('https://lesbases.anct.gouv.fr/'),
    )

    expect(found).toBeDefined()
  })
})
