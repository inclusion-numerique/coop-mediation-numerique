import { describe, expect, it } from 'vitest'
import { roleLu } from './role.transfer'

describe('rôle lu en base', () => {
  it.each([
    ['Admin', 'Admin'],
    ['User', 'User'],
    ['Support', 'User'],
  ])('lit le rôle %s comme %s', (enBase, attendu) => {
    expect(roleLu(enBase)).toBe(attendu)
  })
})
