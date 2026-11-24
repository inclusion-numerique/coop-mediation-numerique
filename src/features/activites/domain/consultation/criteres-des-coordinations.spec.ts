import { describe, expect, it } from 'vitest'
import { TagId } from '../identifiants/tag-id'
import { estFiltre } from './criteres-des-coordinations'

describe('critères des activités de coordination', () => {
  it('ne filtrent rien quand ils sont vides', () => {
    expect(estFiltre({ periode: null, types: [], tags: [] })).toBe(false)
  })

  it('filtrent dès qu’un tag est choisi', () => {
    expect(
      estFiltre({
        periode: null,
        types: [],
        tags: [TagId('6f1c2a4e-8b3d-4c5e-9f7a-1b2c3d4e5f60')],
      }),
    ).toBe(true)
  })
})
