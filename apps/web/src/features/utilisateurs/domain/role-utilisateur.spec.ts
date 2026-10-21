import { estRoleProtege, RoleUtilisateur } from './role-utilisateur'

describe('rôle protégé', () => {
  it.each([
    ['Admin', true],
    ['Support', true],
    ['User', false],
  ] as const)('%s', (role, attendu) => {
    expect(estRoleProtege(RoleUtilisateur(role))).toBe(attendu)
  })
})
