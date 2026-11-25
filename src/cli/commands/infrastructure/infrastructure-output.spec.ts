import { describe, expect, it } from 'vitest'
import { valuesOfTofuOutput } from './infrastructure-output'

describe('valuesOfTofuOutput', () => {
  it('keeps the value of each output of tofu output -json', () => {
    expect(
      valuesOfTofuOutput({
        webBaseUrl: { value: 'dev.example.org' },
        databasePort: { value: 5432 },
      }),
    ).toEqual({ webBaseUrl: 'dev.example.org', databasePort: 5432 })
  })
})
