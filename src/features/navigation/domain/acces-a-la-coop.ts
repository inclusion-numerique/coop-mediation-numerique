export type RoleDuCompte = 'User' | 'Admin'

export type RoleHorsCoop = Exclude<RoleDuCompte, 'User'>

export type AccesALaCoop =
  | { readonly _tag: 'ReserveAuxUtilisateurs'; readonly role: RoleHorsCoop }
  | { readonly _tag: 'InscriptionInachevee' }
  | { readonly _tag: 'Ouvert' }

export const accesALaCoop = ({
  role,
  inscriptionAchevee,
}: {
  readonly role: RoleDuCompte
  readonly inscriptionAchevee: boolean
}): AccesALaCoop => {
  if (role !== 'User') return { _tag: 'ReserveAuxUtilisateurs', role }
  if (!inscriptionAchevee) return { _tag: 'InscriptionInachevee' }
  return { _tag: 'Ouvert' }
}
