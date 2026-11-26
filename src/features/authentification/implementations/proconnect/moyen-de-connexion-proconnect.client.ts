import type { CallbacksOptions } from 'next-auth'
import { signaler } from '@/configuration/telemetry/serveur'
import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import { telephoneEnregistrable } from '@/libraries/telephone'
import { proConnectProviderId } from './proconnect.client'
import { ProConnectProvider } from './proconnect-provider.client'

type ProfilALaConnexion = {
  email: string
  given_name: string
  usual_name: string
  phone_number: string | null
  siret?: string | null
}

type CompteALaConnexion = {
  provider: string
  access_token?: string
  refresh_token?: string
  expires_at?: number
  id_token?: string
  scope?: string
}

const sessionUserHasOutdatedData = ({
  user,
  profile,
}: {
  user: UtilisateurDeLaSession
  profile: ProfilALaConnexion
}) =>
  user.firstName !== profile.given_name ||
  user.lastName !== profile.usual_name ||
  user.phone !== telephoneEnregistrable(profile.phone_number) ||
  (profile.siret && user.siret !== profile.siret)

const affichage: { readonly via: 'proconnect'; readonly fournisseur: string } =
  { via: 'proconnect', fournisseur: proConnectProviderId }

export const moyenDeConnexionProConnect = {
  fournisseurs: () => [ProConnectProvider()],
  aLaConnexion:
    ({
      garantirLeRoleCoordinateur,
      importerLEmployeuseProConnect,
      enregistrerLesDonneesDeLUtilisateur,
      mettreAJourLesJetons,
      enregistrerLaDerniereConnexion,
    }: {
      garantirLeRoleCoordinateur: (userId: string) => Promise<unknown>
      importerLEmployeuseProConnect: (input: {
        userId: string
        siret: string | null | undefined
      }) => Promise<unknown>
      enregistrerLesDonneesDeLUtilisateur: (donnees: {
        userId: string
        firstName: string
        lastName: string
        phone: string | null
        siret: string | null
      }) => Promise<void>
      mettreAJourLesJetons: (jetons: {
        userId: string
        provider: string
        tokens: {
          access_token?: string | undefined
          refresh_token?: string | undefined
          expires_in?: number | undefined
          id_token?: string | undefined
          scope?: string | undefined
        }
      }) => Promise<void>
      enregistrerLaDerniereConnexion: (connexion: {
        userId: string
      }) => Promise<void>
    }): CallbacksOptions['signIn'] =>
    async (params) => {
      const { user, profile, account } = params as unknown as {
        user: UtilisateurDeLaSession
        profile: ProfilALaConnexion
        account: CompteALaConnexion
      }

      if (account?.provider === proConnectProviderId && account.access_token) {
        mettreAJourLesJetons({
          userId: user.id,
          provider: proConnectProviderId,
          tokens: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_in: account.expires_at,
            id_token: account.id_token,
            scope: account.scope,
          },
        }).catch((error) => {
          signaler(error)
        })
      }

      if (sessionUserHasOutdatedData({ user, profile })) {
        enregistrerLesDonneesDeLUtilisateur({
          userId: user.id,
          firstName: profile.given_name,
          lastName: profile.usual_name,
          phone: profile.phone_number,
          siret: profile.siret || null,
        }).catch((error) => {
          signaler(error)
        })
      }

      garantirLeRoleCoordinateur(user.id)
        .catch((error: unknown) => {
          signaler(error)
        })
        .then(() =>
          importerLEmployeuseProConnect({
            userId: user.id,
            siret: profile.siret,
          }),
        )
        .catch((error: unknown) => {
          signaler(error)
        })

      enregistrerLaDerniereConnexion({ userId: user.id }).catch((error) => {
        signaler(error)
      })
      return true
    },
  affichage,
}
