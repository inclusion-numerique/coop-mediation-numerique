import { SessionUser } from '@app/web/auth/sessionUser'

export type RdvOauthIntegrationStatus = 'none' | 'success' | 'error'

export const getRdvOauthIntegrationStatus = ({
  user,
}: {
  user: Pick<SessionUser, 'rdvAccount'> | null
}): RdvOauthIntegrationStatus => {
  if (!user || !user.rdvAccount) {
    return 'none'
  }

  return user.rdvAccount.hasOauthTokens ? 'success' : 'error'
}
