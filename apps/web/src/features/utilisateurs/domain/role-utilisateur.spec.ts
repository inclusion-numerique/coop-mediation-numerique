import { estRoleProtege, RoleUtilisateur } from './role-utilisateur'

describe('rôle protégé', () => {
  // Se priver silencieusement d'un administrateur ou d'un support est une panne
  // d'exploitation, pas une suppression de compte. `Support` n'était jusqu'ici
  // exercé par aucun test.
  it.each([
    ['Admin', true],
    ['Support', true],
    ['User', false],
  ] as const)('%s', (role, attendu) => {
    expect(estRoleProtege(RoleUtilisateur(role))).toBe(attendu)
  })
})
