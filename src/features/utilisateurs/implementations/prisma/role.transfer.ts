import { RoleUtilisateur } from '../../domain/role-utilisateur'

export const roleLu = (role: string): RoleUtilisateur =>
  RoleUtilisateur(role === 'Admin' ? 'Admin' : 'User')
