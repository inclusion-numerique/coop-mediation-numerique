import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { ProConnectProvider } from '@app/web/auth/ProConnectProvider'
import { authenticationViaProconnect } from '@app/web/auth/authenticationProvider'
import { nextAuthAdapter } from '@app/web/auth/nextAuthAdapter'
import { sendVerificationRequest } from '@app/web/auth/sendVerificationRequest'
import { SessionUser } from '@app/web/auth/sessionUser'
import { updateUserData } from '@app/web/auth/updateUserData'
import { registerLastLogin } from '@app/web/security/registerLastLogin'
import * as Sentry from '@sentry/nextjs'
import type { AuthOptions } from 'next-auth'
import Email from 'next-auth/providers/email'

const isOutdatedUserData =
  (user: SessionUser) =>
  (profile: {
    given_name: string
    usual_name: string
    phone_number: string | null
  }) =>
    user.firstName !== profile.given_name ||
    user.lastName !== profile.usual_name ||
    user.phone !== profile.phone_number

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
        registerLastLogin({ userId: params.user.id }).catch((error) => {
          Sentry.captureException(error)
        })
        return true
      }

      // The rest of this function will execute for ProConnect flow

      const { user, profile } = params as unknown as {
        user: SessionUser
        profile: {
          given_name: string
          usual_name: string
          phone_number: string | null
        }
      }

      if (isOutdatedUserData(user)(profile)) {
        updateUserData({
          userId: user.id,
          firstName: profile.given_name,
          lastName: profile.usual_name,
          phone: profile.phone_number,
        }).catch((error) => {
          Sentry.captureException(error)
        })
      }

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
