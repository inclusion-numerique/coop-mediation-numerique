import NextAuth, { NextAuthOptions } from 'next-auth'
import { nextAuthAdapter } from '@app/web/auth/nextAuthAdapter'
import '@app/web/auth/nextAuthSetup'
import { InclusionConnectProvider } from '@app/web/auth/InclusionConnectProvider'

export const authOptions: NextAuthOptions = {
  // debug: process.env.NODE_ENV !== 'production',
  adapter: nextAuthAdapter,
  pages: {
    signIn: '/connexion',
    signOut: '/deconnexion',
    error: '/connexion/erreur',
    verifyRequest: '/connexion/verification',
    // This would be the first page the user sees after signing up
    // newUser: '/bienvenue',
  },
  providers: [InclusionConnectProvider()],
  callbacks: {
    signIn({ account, user }) {
      const isAllowedToSignIn =
        // KeyCloak is a type of oauth
        account?.type === 'oauth' ||
        // If user exists and comes from prisma, we will have User model properties defined
        ('created' in user &&
          !!user.created &&
          'updated' in user &&
          !!user.updated)

      if (isAllowedToSignIn) {
        return true
      }
      // Return false to display a default error message
      // return false

      // Or you can return a URL to redirect to:
      return `/creer-un-compte?raison=connexion-sans-compte&email=${
        user?.email ?? ''
      }`
    },
    session: ({ session, user }) => {
      if (session.user) {
        // eslint-disable-next-line no-param-reassign
        session.user.id = user.id
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
