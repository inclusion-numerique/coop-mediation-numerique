import type { UserRdvAccount } from '../utils/user'

export type RdvOauthIntegrationStatus = 'none' | 'success' | 'error'

export const getRdvOauthIntegrationStatus = ({
  user,
}: {
  user: UserRdvAccount | null
}): RdvOauthIntegrationStatus => {
  if (!user || !user.rdvAccount) {
    return 'none'
  }

  if (user.rdvAccount.error) {
    return 'error'
  }

  return user.rdvAccount.hasOauthTokens ? 'success' : 'error'
}
