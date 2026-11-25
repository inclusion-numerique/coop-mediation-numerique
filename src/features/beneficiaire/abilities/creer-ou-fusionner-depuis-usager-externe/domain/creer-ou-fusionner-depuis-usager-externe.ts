// Port d'anti-corruption : crée ou fusionne un bénéficiaire à partir d'un usager
// d'un système EXTERNE (ex. RDV Service Public), à partir de PRIMITIFS bruts.
// L'appelant (feature rdvsp) ne connaît ni les value objects, ni la persistance
// du bénéficiaire — il passe des chaînes/dates et reçoit un DTO.

// Entrée : données brutes non fiables d'un usager externe, identifié par son id
// dans le système source (ici `rdvUserId`, la clé de liaison en base Coop).
export type UsagerExterneAFusionner = {
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

export type CreerOuFusionnerBeneficiairesDepuisUsagersExternes = (input: {
  usagers: UsagerExterneAFusionner[]
  mediateurId: string
}) => Promise<{
  merges: MergedBeneficiaire[]
  skipped: { readonly rdvUserId: number; readonly reason: unknown }[]
}>

export type CommuneFields = {
  readonly commune: string
  readonly communeCodePostal: string
  readonly communeCodeInsee: string
}
