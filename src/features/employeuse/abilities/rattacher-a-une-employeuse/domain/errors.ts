export type EmployeuseIndisponible = {
  readonly _tag: 'EmployeuseIndisponible'
}

export const EmployeuseIndisponible = (): EmployeuseIndisponible => ({
  _tag: 'EmployeuseIndisponible',
})

export type IdentiteInexploitable = {
  readonly _tag: 'IdentiteInexploitable'
}

export const IdentiteInexploitable = (): IdentiteInexploitable => ({
  _tag: 'IdentiteInexploitable',
})

export type UtilisateurIntrouvable = {
  readonly _tag: 'UtilisateurIntrouvable'
}

export const UtilisateurIntrouvable = (): UtilisateurIntrouvable => ({
  _tag: 'UtilisateurIntrouvable',
})

export type EchecDeRattacherAUneEmployeuse =
  | EmployeuseIndisponible
  | IdentiteInexploitable
  | UtilisateurIntrouvable
