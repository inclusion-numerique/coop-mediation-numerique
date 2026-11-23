type UsagerExterne = {
  readonly rdvUserId: number
  readonly nom: string | null
  readonly prenom: string | null
  readonly telephone: string | null
  readonly email: string | null
  readonly adresse: string | null
  readonly birthDate: Date | null
}

export type CreerOuFusionnerDepuisUsagersExternes<Fusionne = unknown> =
  (input: { usagers: UsagerExterne[]; mediateurId: string }) => Promise<{
    merges: readonly Fusionne[]
    skipped: readonly { readonly rdvUserId: number; readonly reason: unknown }[]
  }>
