type RoleDeLaSession = 'User' | 'Admin'

type ProfilDInscriptionDeLaSession =
  | 'ConseillerNumerique'
  | 'CoordinateurConseillerNumerique'
  | 'Mediateur'
  | 'Coordinateur'

export type UtilisateurDeLaSession = {
  id: string
  firstName: string | null
  lastName: string | null
  name: string | null
  email: string
  phone: string | null
  siret: string | null
  role: RoleDeLaSession
  isFixture: boolean
  profilInscription: ProfilDInscriptionDeLaSession | null
  acceptationCgu: Date | null
  timezone: string
  /**
   * Dispositif conseiller numérique DÉRIVÉ de l'affectation `idposte` active, et non plus lu dans
   * une colonne. Il reste un booléen dans la session : les écrans n'ont pas à connaître la règle.
   */
  isConseillerNumerique: boolean
  emailVerified: string | null
  created: string | null
  updated: string | null
  hasSeenOnboarding: string | null
  inscriptionValidee: string | null
  structureEmployeuseRenseignee: string | null
  lieuxActiviteRenseignes: string | null
  usurper: { id: string } | null
  // Une employeuse peut n'avoir aucune dénomination — d'où `nom: string | null`.
  emplois: {
    id: string
    structure: { nom: string | null; codeInsee: string | null }
  }[]
  mediateur:
    | ({ id: string; isVisible: boolean } & {
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
    | ({ id: string } & {
        mediateursCoordonnes: { mediateurId: string }[]
        ancienMediateursCoordonnes: { mediateurId: string }[]
      })
    | null
  rdvAccount:
    | ({
        id: number
        error: string | null
        includeRdvsInActivitesList: boolean
        invalidWebhookOrganisationIds: number[]
      } & {
        hasOauthTokens: boolean
        deconnexion: string | null
        jetonDAcces: boolean
        created: string | null
        updated: string | null
        lastSynced: string | null
        syncFrom: string | null
        organisations: { id: number; name: string; email: string | null }[]
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
export const aUneStructureEmployeuse = <T extends { emplois: unknown[] }>(
  user: T,
): user is T & {
  emplois: [T['emplois'][number], ...T['emplois'][number][]]
} => {
  return user.emplois.length > 0
}
