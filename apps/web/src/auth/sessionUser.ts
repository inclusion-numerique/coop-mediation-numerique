import type {
  Coordinateur,
  EmployeStructure,
  Mediateur,
  RdvAccount,
  RdvOrganisation,
  StructureAdministrative,
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
    structure: Pick<StructureAdministrative, 'nom' | 'codeInsee'>
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
// Générique sur la forme des emplois (le guard ne vérifie que la présence d'au moins un emploi) :
// accepte aussi bien le SessionUser sérialisé (`emplois[].structure`) que le résultat Prisma brut de
// `sessionUserSelect` (`emplois[].structureMain`, ADR-002 étape 6), en préservant la forme de chaque
// appelant après narrowing.
export const sessionUserHasStructureEmployeuse = <
  T extends { emplois: unknown[] },
>(
  user: T,
): user is T & {
  emplois: [T['emplois'][number], ...T['emplois'][number][]]
} => {
  return user.emplois.length > 0
}
