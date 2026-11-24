import { describe, expect, it } from 'vitest'
import { filtresDeLExport } from './filtres-de-l-export.search-params'

describe("filtres de l'export", () => {
  it('refuse des paramètres invalides', () => {
    expect(filtresDeLExport({ du: '30/06/2026' })).toBeNull()
  })

  it('lit des paramètres valides', () => {
    expect(filtresDeLExport({ du: '2026-01-01' })).toStrictEqual({
      du: '2026-01-01',
    })
  })
})
