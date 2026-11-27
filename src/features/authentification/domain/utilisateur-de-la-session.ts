import type { CompteDeLaSessionId } from './compte-de-la-session-id'
import type { CourrielDeLaSession } from './courriel-de-la-session'
import type { ProfilDInscription } from './profil-d-inscription'
import type { RoleDeLaSession } from './role-de-la-session'

export type UtilisateurDeLaSession = {
  id: CompteDeLaSessionId
  firstName: string | null
  lastName: string | null
  name: string | null
  email: CourrielDeLaSession
  phone: string | null
  siret: string | null
  role: RoleDeLaSession
  isFixture: boolean
  profilInscription: ProfilDInscription | null
  acceptationCgu: Date | null
  timezone: string
  isConseillerNumerique: boolean
  emailVerified: string | null
  created: string | null
  updated: string | null
  hasSeenOnboarding: string | null
  inscriptionValidee: string | null
  structureEmployeuseRenseignee: string | null
  lieuxActiviteRenseignes: string | null
  usurper: { id: string } | null
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

export const aUneStructureEmployeuse = <T extends { emplois: unknown[] }>(
  user: T,
): user is T & {
  emplois: [T['emplois'][number], ...T['emplois'][number][]]
} => {
  return user.emplois.length > 0
}
