export type SireneIndisponible = {
  readonly _tag: 'SireneIndisponible'
}

export const SireneIndisponible = (): SireneIndisponible => ({
  _tag: 'SireneIndisponible',
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
  | SireneIndisponible
  | IdentiteInexploitable
  | UtilisateurIntrouvable
