import type {
  PrismaSessionUser,
  PrismaSessionUsupper,
} from '@app/web/auth/getSessionUserFromSessionToken'
import type { SessionUser } from '@app/web/auth/sessionUser'

/**
 * This is the session user that will be publicly sent to the client.
 * DO NOT INCLUDE ANY SECRET DATA IN THIS OBJECT
 */
export const serializePrismaSessionUser = (
  prismaSessionUser: PrismaSessionUser,
  usurper?: PrismaSessionUsupper,
): SessionUser => ({
  ...prismaSessionUser,
  emailVerified: prismaSessionUser.emailVerified?.toISOString() ?? null,
  created: prismaSessionUser.created.toISOString(),
  updated: prismaSessionUser.updated.toISOString(),
  hasSeenOnboarding: prismaSessionUser.hasSeenOnboarding?.toISOString() ?? null,
  inscriptionValidee:
    prismaSessionUser.inscriptionValidee?.toISOString() ?? null,
  structureEmployeuseRenseignee:
    prismaSessionUser.structureEmployeuseRenseignee?.toISOString() ?? null,
  lieuxActiviteRenseignes:
    prismaSessionUser.lieuxActiviteRenseignes?.toISOString() ?? null,
  usurper: usurper ?? null,
  rdvAccount: prismaSessionUser.rdvAccount
    ? {
        id: prismaSessionUser.rdvAccount.id,
        hasOauthTokens: !!(
          prismaSessionUser.rdvAccount.accessToken &&
          prismaSessionUser.rdvAccount.refreshToken
        ),
        error: prismaSessionUser.rdvAccount.error ?? null,
        created: prismaSessionUser.rdvAccount.created.toISOString(),
        updated: prismaSessionUser.rdvAccount.updated.toISOString(),
        syncFrom: prismaSessionUser.rdvAccount.syncFrom?.toISOString() ?? null,
        lastSynced:
          prismaSessionUser.rdvAccount.lastSynced?.toISOString() ?? null,
        organisations: prismaSessionUser.rdvAccount.organisations.map(
          ({ organisation }) => organisation,
        ),
      }
    : null,
})
