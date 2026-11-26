import { describe, expect, it } from 'vitest'
import { estRoleProtege, RoleUtilisateur } from './role-utilisateur'

describe('rôle protégé', () => {
  it.each<[RoleUtilisateur, boolean]>([
    [RoleUtilisateur('Admin'), true],
    [RoleUtilisateur('User'), false],
  ])('%s', (role, attendu) => {
    expect(estRoleProtege(role)).toBe(attendu)
  })
})
