import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Adapter, AdapterAccount, AdapterUser } from 'next-auth/adapters'
import { v4 } from 'uuid'
import { extendedPrismaClient, prismaClient } from '@/configuration/prisma'
import type { SynchroniserLaPersonne } from '@/features/authentification/implementations/prisma/synchroniser-la-personne.mutation'

const adapterAvecLesMethodesRequises = (): Adapter & {
  createUser: Exclude<Adapter['createUser'], undefined>
  deleteSession: Exclude<Adapter['deleteSession'], undefined>
} => {
  const prismaAdapter = PrismaAdapter(extendedPrismaClient)

  const { createUser, deleteSession } = prismaAdapter

  if (!createUser) throw new Error('prismaAdapter.createUser is undefined')
  if (!deleteSession)
    throw new Error('prismaAdapter.deleteSession is undefined')

  return {
    ...prismaAdapter,
    createUser,
    deleteSession,
  }
}

const prismaAdapter = adapterAvecLesMethodesRequises()

const creerLeCompte =
  (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  (data: Omit<AdapterUser, 'id'>) =>
    prismaClient.$transaction(async (transaction) => {
      const compte = await transaction.user.create({ data })
      await synchroniserLaPersonne(transaction, compte.id)
      return compte
    })

const compteALier = (account: AdapterAccount) => ({
  userId: account.userId,
  type: account.type,
  provider: account.provider,
  providerAccountId: account.providerAccountId,
  refresh_token: account.refresh_token ?? null,
  access_token: account.access_token ?? null,
  expires_at: account.expires_at ?? null,
  token_type: account.token_type ?? null,
  scope: account.scope ?? null,
  id_token: account.id_token ?? null,
  session_state: account.session_state ?? null,
})

const ENREGISTREMENT_INTROUVABLE = 'P2025'

const estUneSessionDejaSupprimee = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === ENREGISTREMENT_INTROUVABLE

export const nextAuthAdapter = ({
  synchroniserLaPersonne,
  fournisseurQuiVerifieLAdresse,
}: {
  synchroniserLaPersonne: SynchroniserLaPersonne
  fournisseurQuiVerifieLAdresse: string
}) =>
  ({
    ...prismaAdapter,
    createUser: async (user: Omit<AdapterUser, 'id'>) => {
      const {
        provider,
        ...rest
      }: Omit<AdapterUser, 'id'> & { readonly provider?: unknown } = user

      const info = { id: v4(), ...rest }

      if (provider === fournisseurQuiVerifieLAdresse) {
        return creerLeCompte(synchroniserLaPersonne)({
          ...info,
          emailVerified: new Date(),
        })
      }
      return creerLeCompte(synchroniserLaPersonne)(info)
    },
    deleteSession: async (sessionToken) => {
      try {
        await prismaAdapter.deleteSession(sessionToken)
      } catch (error) {
        if (estUneSessionDejaSupprimee(error)) return
        throw error
      }
    },
    linkAccount: async (account: AdapterAccount) => {
      await prismaClient.account.create({ data: compteALier(account) })
    },
  }) satisfies Adapter
