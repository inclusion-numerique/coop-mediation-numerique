import type {
  AUTONOMIES,
  GENRES,
  MATERIELS,
  NIVEAUX_D_ATELIER,
  STATUTS_SOCIAUX,
  STRUCTURES_DE_REDIRECTION,
  THEMATIQUES_ADMINISTRATIVES,
  THEMATIQUES_DE_MEDIATION,
  TRANCHES_D_AGE,
  TYPES_D_ACTIVITE,
  TYPES_DE_LIEU,
} from '../../../domain'

type Valeur<Liste extends readonly string[]> = Liste[number]

export type BeneficiaireCompte = {
  readonly genre: Valeur<typeof GENRES> | null
  readonly trancheAge: Valeur<typeof TRANCHES_D_AGE> | null
  readonly statutSocial: Valeur<typeof STATUTS_SOCIAUX> | null
}

export type ActiviteExposee = {
  readonly id: string
  readonly type: Valeur<typeof TYPES_D_ACTIVITE>
  readonly suppression: Date | null
  readonly modification: Date
  readonly creation: Date
  readonly date: Date
  readonly duree: number
  readonly structureId: string | null
  readonly lieuCodePostal: string | null
  readonly lieuCommune: string | null
  readonly lieuCodeInsee: string | null
  readonly mediateurId: string
  readonly typeLieu: Valeur<typeof TYPES_DE_LIEU>
  readonly mediateur: { readonly userId: string }
  readonly autonomie: Valeur<typeof AUTONOMIES> | null
  readonly structureDeRedirection: Valeur<
    typeof STRUCTURES_DE_REDIRECTION
  > | null
  readonly materiel: readonly (Valeur<typeof MATERIELS> | 'Aucun')[]
  readonly thematiques: readonly (
    | Valeur<typeof THEMATIQUES_DE_MEDIATION>
    | 'AideAuxDemarchesAdministratives'
    | Valeur<typeof THEMATIQUES_ADMINISTRATIVES>
  )[]
  readonly orienteVersStructure: boolean | null
  readonly precisionsDemarche: string | null
  readonly titreAtelier: string | null
  readonly niveau: Valeur<typeof NIVEAUX_D_ATELIER> | null
  readonly accompagnementsCount: number
  readonly tags: readonly { readonly tag: { readonly nom: string } }[]
  readonly accompagnements: readonly {
    readonly beneficiaire: BeneficiaireCompte
  }[]
}
