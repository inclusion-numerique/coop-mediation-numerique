import type {
  Coordinateur,
  EmployeStructure,
  Mediateur,
  RdvAccount,
  RdvOrganisation,
  Structure,
  User,
} from '@prisma/client'

// Serializable user interface
export type SessionUser = Pick<
  User,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'name'
  | 'email'
  | 'phone'
  | 'siret'
  | 'role'
  | 'isFixture'
  | 'profilInscription'
  | 'acceptationCgu'
  | 'featureFlags'
  | 'timezone'
  | 'isConseillerNumerique'
> & {
  emailVerified: string | null
  created: string | null
  updated: string | null
  hasSeenOnboarding: string | null
  inscriptionValidee: string | null
  structureEmployeuseRenseignee: string | null
  lieuxActiviteRenseignes: string | null
  usurper: { id: string } | null
  emplois: (Pick<EmployeStructure, 'id'> & {
    structure: Pick<Structure, 'nom' | 'codeInsee'>
  })[]
  mediateur:
    | (Pick<Mediateur, 'id' | 'isVisible'> & {
        coordinations: {
          coordinateur: {
            id: string
            user: { name: string | null }
            mediateursCoordonnes: {
              id: string
              mediateurId: string
              suppression: Date | null
            }[]
          }
        }[]
        _count: { enActivite: number }
      })
    | null
  coordinateur:
    | (Pick<Coordinateur, 'id'> & {
        mediateursCoordonnes: { mediateurId: string }[]
        ancienMediateursCoordonnes: { mediateurId: string }[]
      })
    | null
  rdvAccount:
    | (Pick<
        RdvAccount,
        | 'id'
        | 'error'
        | 'includeRdvsInActivitesList'
        | 'invalidWebhookOrganisationIds'
      > & {
        hasOauthTokens: boolean
        created: string | null
        updated: string | null
        lastSynced: string | null
        syncFrom: string | null
        organisations: Pick<RdvOrganisation, 'id' | 'name' | 'email'>[]
      })
    | null
}

/**
 * Type guard to check if user has at least one structure employeuse (emploi)
 * Narrows the type to ensure emplois is a non-empty array
 */
export const sessionUserHasStructureEmployeuse = <
  T extends Pick<SessionUser, 'emplois'>,
>(
  user: T,
): user is T & {
  emplois: [
    Pick<EmployeStructure, 'id'> & {
      structure: Pick<Structure, 'nom' | 'codeInsee'>
    },
    ...(Pick<EmployeStructure, 'id'> & {
      structure: Pick<Structure, 'nom' | 'codeInsee'>
    })[],
  ]
} => {
  return user.emplois.length > 0
}
