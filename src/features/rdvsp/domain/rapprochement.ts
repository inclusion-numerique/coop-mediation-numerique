export type UsagerExterne = {
  readonly rdvUserId: number
  readonly nom: string | null
  readonly prenom: string | null
  readonly telephone: string | null
  readonly email: string | null
  readonly adresse: string | null
  readonly birthDate: Date | null
}

export type DemandeDeRapprochement = {
  readonly usagers: readonly UsagerExterne[]
  readonly mediateurId: string
}

export type Rapprochement =
  | { readonly _tag: 'sansObjet' }
  | ({
      readonly _tag: 'reussi'
      readonly ecartes: number
    } & DemandeDeRapprochement)
  | ({
      readonly _tag: 'echoue'
      readonly message: string
    } & DemandeDeRapprochement)
