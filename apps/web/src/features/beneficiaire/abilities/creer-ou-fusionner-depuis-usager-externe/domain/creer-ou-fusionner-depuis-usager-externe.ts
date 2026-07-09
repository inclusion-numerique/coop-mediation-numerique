// Port d'anti-corruption : crée ou fusionne un bénéficiaire à partir d'un usager
// d'un système EXTERNE (ex. RDV Service Public), à partir de PRIMITIFS bruts.
// L'appelant (feature rdvsp) ne connaît ni les value objects, ni la persistance
// du bénéficiaire — il passe des chaînes/dates et reçoit un DTO.

// Entrée : données brutes non fiables d'un usager externe, identifié par son id
// dans le système source (ici `rdvUserId`, la clé de liaison en base Coop).
export type ExternalUserToMerge = {
  readonly rdvUserId: number
  readonly nom: string | null
  readonly prenom: string | null
  readonly telephone: string | null
  readonly email: string | null
  readonly adresse: string | null
  readonly birthDate: Date | null
}

// Projection de sortie POSSÉDÉE par le port (pas l'entité interne). Structure
// stable consommée par la construction des CRA et les hubs rdvsp.
export type MergedBeneficiaire = {
  readonly id: string
  readonly nom: string | null
  readonly prenom: string | null
  readonly email: string | null
  readonly telephone: string | null
  readonly mediateurId: string
  readonly adresse: string | null
  readonly anneeNaissance: number | null
  readonly commune: string | null
}

// Issue par usager : fusionné, ou écarté (donnée d'infra en échec) — jamais un
// throw qui interromprait le lot. La donnée invalide (value objects) est, elle,
// absorbée en amont (`.safe`) et ne produit donc pas de `Skipped`.
export type MergeOutcome =
  | { readonly _tag: 'Merged'; readonly beneficiaire: MergedBeneficiaire }
  | {
      readonly _tag: 'Skipped'
      readonly rdvUserId: number
      readonly reason: unknown
    }

export type CreerOuFusionnerBeneficiairesDepuisUsagersExternes = (input: {
  usagers: ExternalUserToMerge[]
  mediateurId: string
}) => Promise<{
  merges: MergedBeneficiaire[]
  skipped: { readonly rdvUserId: number; readonly reason: unknown }[]
}>
