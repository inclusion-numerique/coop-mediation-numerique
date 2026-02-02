import { authenticationViaProconnect } from '@app/web/auth/authenticationProvider'
import { nextAuthAdapter } from '@app/web/auth/nextAuthAdapter'
import { ProConnectProvider } from '@app/web/auth/ProConnectProvider'
import { previewBranchAuthFallbacks } from '@app/web/auth/previewBranchAuthFallbacks'
import { proConnectProviderId } from '@app/web/auth/proConnect'
import { sendVerificationRequest } from '@app/web/auth/sendVerificationRequest'
import { SessionUser } from '@app/web/auth/sessionUser'
import { updateAccountTokens } from '@app/web/auth/updateAccountTokens'
import { updateUserData } from '@app/web/auth/updateUserData'
import { importStructureEmployeuseFromProConnect } from '@app/web/features/utilisateurs/use-cases/import-structure-from-proconnect/importStructureEmployeuseFromProConnect'
import { updateUserFromDataspaceData } from '@app/web/features/utilisateurs/use-cases/update-from-dataspace/updateUserFromDataspaceData'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { registerLastLogin } from '@app/web/security/registerLastLogin'
import * as Sentry from '@sentry/nextjs'
import type { AuthOptions } from 'next-auth'
import Email from 'next-auth/providers/email'

const sessionUserHasOutdatedData = ({
  user,
  profile,
}: {
  user: SessionUser
  profile: {
    given_name: string
    usual_name: string
    phone_number: string | null
    siret?: string | null
  }
}) =>
  user.firstName !== profile.given_name ||
  user.lastName !== profile.usual_name ||
  user.phone !== profile.phone_number ||
  (profile.siret && user.siret !== profile.siret)

export const nextAuthOptions = {
  adapter: nextAuthAdapter,
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
          ...ServerWebAppConfig.Email,
          sendVerificationRequest,
        }),
      ],
  callbacks: {
    signIn(params) {
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
        const emailParts = user.email.split('@')[0].split('.')
        const fallbackFirstName = emailParts[0] || 'User'
        const fallbackLastName = emailParts[1] || '-'
        const fallbackSiret = previewBranchAuthFallbacks.anctSiret

        // Update user with fallback data if not set
        if (!user.firstName || !user.lastName || !user.siret) {
          updateUserData({
            userId: user.id,
            firstName: user.firstName || fallbackFirstName,
            lastName: user.lastName || fallbackLastName,
            phone: user.phone || null,
            siret: user.siret || fallbackSiret,
          }).catch((error) => {
            Sentry.captureException(error)
          })
        }

        updateUserFromDataspaceData({ userId: user.id }).catch((error) => {
          Sentry.captureException(error)
        })

        registerLastLogin({ userId: params.user.id }).catch((error) => {
          Sentry.captureException(error)
        })
        return true
      }

      // The rest of this function will execute for ProConnect flow

      const { user, profile, account } = params as unknown as {
        user: SessionUser
        profile: {
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
          Sentry.captureException(error)
        })
      }

      if (sessionUserHasOutdatedData({ user, profile })) {
        updateUserData({
          userId: user.id,
          firstName: profile.given_name,
          lastName: profile.usual_name,
          phone: profile.phone_number,
          siret: profile.siret || null,
        }).catch((error) => {
          Sentry.captureException(error)
        })
      }

      updateUserFromDataspaceData({ userId: user.id }).catch((error) => {
        Sentry.captureException(error)
      })

      importStructureEmployeuseFromProConnect({
        userId: user.id,
        siret: profile.siret,
      }).catch((error) => {
        Sentry.captureException(error)
      })

      registerLastLogin({ userId: user.id }).catch((error) => {
        Sentry.captureException(error)
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
} satisfies AuthOptions
