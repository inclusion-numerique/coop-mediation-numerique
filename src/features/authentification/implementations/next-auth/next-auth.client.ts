import type { AuthOptions, CallbacksOptions } from 'next-auth'
import { updateAccountTokens } from '@/features/authentification/implementations/prisma/account-tokens.mutation'
import { enregistrerLaDerniereConnexion } from '@/features/authentification/implementations/prisma/derniere-connexion.mutation'
import { enregistrerLesDonneesDeLUtilisateur } from '@/features/authentification/implementations/prisma/donnees-de-l-utilisateur.mutation'
import { nextAuthAdapter } from '@/features/authentification/implementations/prisma/next-auth.adapter'
import type { SynchroniserLaPersonne } from '@/features/authentification/implementations/prisma/synchroniser-la-personne.mutation'
import { proConnectProviderId } from '@/features/authentification/implementations/proconnect/proconnect.client'

type ServicesDeLaConnexion = {
  garantirLeRoleCoordinateur: (userId: string) => Promise<unknown>
  importerLEmployeuseProConnect: (input: {
    userId: string
    siret: string | null | undefined
  }) => Promise<unknown>
  enregistrerLesDonneesDeLUtilisateur: ReturnType<
    typeof enregistrerLesDonneesDeLUtilisateur
  >
  mettreAJourLesJetons: typeof updateAccountTokens
  enregistrerLaDerniereConnexion: typeof enregistrerLaDerniereConnexion
}

type MoyenDeConnexion = {
  readonly fournisseurs: () => AuthOptions['providers']
  readonly aLaConnexion: (
    services: ServicesDeLaConnexion,
  ) => CallbacksOptions['signIn']
}

export const nextAuthOptions = ({
  moyenDeConnexion,
  garantirLeRoleCoordinateur,
  importerLEmployeuseProConnect,
  synchroniserLaPersonne,
}: {
  moyenDeConnexion: MoyenDeConnexion
  garantirLeRoleCoordinateur: (userId: string) => Promise<unknown>
  importerLEmployeuseProConnect: (input: {
    userId: string
    siret: string | null | undefined
  }) => Promise<unknown>
  synchroniserLaPersonne: SynchroniserLaPersonne
}): AuthOptions => ({
  adapter: nextAuthAdapter({
    synchroniserLaPersonne,
    fournisseurQuiVerifieLAdresse: proConnectProviderId,
  }),
  pages: {
    signIn: '/connexion',
    signOut: '/deconnexion',
    error: '/connexion/erreur',
    verifyRequest: '/connexion/verification',
  },
  providers: moyenDeConnexion.fournisseurs(),
  callbacks: {
    signIn: moyenDeConnexion.aLaConnexion({
      garantirLeRoleCoordinateur,
      importerLEmployeuseProConnect,
      enregistrerLesDonneesDeLUtilisateur: enregistrerLesDonneesDeLUtilisateur(
        synchroniserLaPersonne,
      ),
      mettreAJourLesJetons: updateAccountTokens,
      enregistrerLaDerniereConnexion,
    }),
    session: ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})
