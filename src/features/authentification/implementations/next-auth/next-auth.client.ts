import type { AuthOptions } from 'next-auth'
import Email from 'next-auth/providers/email'
import { previewBranchAuthFallbacks } from '@/configuration/projet'
import { expediteur, serveurSmtp } from '@/configuration/smtp'
import { signaler } from '@/configuration/telemetry/serveur'
import { proConnectProviderId } from '@/features/authentification/domain/fournisseur-proconnect'
import { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import { sendVerificationRequest } from '@/features/authentification/implementations/email/send-verification-request.mutation'
import { authenticationViaProconnect } from '@/features/authentification/implementations/next-auth/authentication-provider.client'
import { updateAccountTokens } from '@/features/authentification/implementations/prisma/account-tokens.mutation'
import { enregistrerLaDerniereConnexion } from '@/features/authentification/implementations/prisma/derniere-connexion.mutation'
import { enregistrerLesDonneesDeLUtilisateur } from '@/features/authentification/implementations/prisma/donnees-de-l-utilisateur.mutation'
import { nextAuthAdapter } from '@/features/authentification/implementations/prisma/next-auth.adapter'
import type { SynchroniserLaPersonne } from '@/features/authentification/implementations/prisma/synchroniser-la-personne.mutation'
import { ProConnectProvider } from '@/features/authentification/implementations/proconnect/proconnect-provider.client'
import { telephoneEnregistrable } from '@/libraries/telephone'

const sessionUserHasOutdatedData = ({
  user,
  profile,
}: {
  user: UtilisateurDeLaSession
  profile: {
    given_name: string
    usual_name: string
    phone_number: string | null
    siret?: string | null
  }
}) =>
  user.firstName !== profile.given_name ||
  user.lastName !== profile.usual_name ||
  user.phone !== telephoneEnregistrable(profile.phone_number) ||
  (profile.siret && user.siret !== profile.siret)

export const nextAuthOptions = ({
  garantirLeRoleCoordinateur,
  importerLEmployeuseProConnect,
  synchroniserLaPersonne,
}: {
  garantirLeRoleCoordinateur: (userId: string) => Promise<unknown>
  importerLEmployeuseProConnect: (input: {
    userId: string
    siret: string | null | undefined
  }) => Promise<unknown>
  synchroniserLaPersonne: SynchroniserLaPersonne
}): AuthOptions => ({
  adapter: nextAuthAdapter(synchroniserLaPersonne),
  pages: {
    signIn: '/connexion',
    signOut: '/deconnexion',
    error: '/connexion/erreur',
    verifyRequest: '/connexion/verification',
    // This would be the first page the user sees after signing up
    // newUser: '/bienvenue',
  },
  providers: authenticationViaProconnect
    ? [ProConnectProvider()]
    : [
        Email({
          server: serveurSmtp,
          from: expediteur,
          sendVerificationRequest,
        }),
      ],
  callbacks: {
    async signIn(params) {
      // For email signin verification request, we should do nothing
      // and continue with the signin flow
      if (params.email?.verificationRequest) {
        return true
      }

      // For an email signin, we don't have a "profile" object
      if (params.account?.provider === 'email' && params.user.id) {
        // Generate fallback data for email authentication
        const user = params.user as {
          id: string
          email: string
          firstName?: string | null
          lastName?: string | null
          phone?: string | null
          siret?: string | null
        }
        const [partieLocale = ''] = user.email.split('@')
        const [prenomDeLAdresse, nomDeLAdresse] = partieLocale.split('.')
        const fallbackFirstName = prenomDeLAdresse || 'User'
        const fallbackLastName = nomDeLAdresse || '-'
        const fallbackSiret = previewBranchAuthFallbacks.anctSiret

        // Update user with fallback data if not set
        if (!user.firstName || !user.lastName || !user.siret) {
          enregistrerLesDonneesDeLUtilisateur(synchroniserLaPersonne)({
            userId: user.id,
            firstName: user.firstName || fallbackFirstName,
            lastName: user.lastName || fallbackLastName,
            phone: user.phone || null,
            siret: user.siret || fallbackSiret,
          }).catch((error) => {
            signaler(error)
          })
        }

        // Le dispositif conseiller numérique se DÉRIVE désormais à la lecture : plus rien à
        // recopier ici. Ne subsiste que la ligne `coop.coordinateurs`, qu'aucune dérivation ne peut
        // produire — et la connexion est le bon moment pour la garantir.
        garantirLeRoleCoordinateur(user.id).catch((error: unknown) => {
          signaler(error)
        })

        enregistrerLaDerniereConnexion({ userId: params.user.id }).catch(
          (error) => {
            signaler(error)
          },
        )
        return true
      }

      // The rest of this function will execute for ProConnect flow

      const { user, profile, account } = params as unknown as {
        user: UtilisateurDeLaSession
        profile: {
          email: string
          given_name: string
          usual_name: string
          phone_number: string | null
          siret?: string | null
        }
        account: {
          provider: string
          access_token?: string
          refresh_token?: string
          expires_at?: number
          id_token?: string
          scope?: string
        }
      }

      // Update account tokens if this is a ProConnect signin
      if (account?.provider === proConnectProviderId && account.access_token) {
        updateAccountTokens({
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
        enregistrerLesDonneesDeLUtilisateur(synchroniserLaPersonne)({
          userId: user.id,
          firstName: profile.given_name,
          lastName: profile.usual_name,
          phone: profile.phone_number,
          siret: profile.siret || null,
        }).catch((error) => {
          signaler(error)
        })
      }

      // Même chose côté ProConnect : plus rien à recopier depuis l'API, seule la ligne coordinateur
      // reste à garantir. L'enchaînement est conservé — l'import ProConnect s'abstient pour un
      // conseiller numérique, il doit donc passer APRÈS.
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
    session: ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})
