import { PrismaSessionUser } from '@app/web/auth/getSessionUserFromSessionToken'
import { serializePrismaSessionUser } from '@app/web/auth/serializePrismaSessionUser'
import { getRdvs } from '@app/web/rdv-service-public/getRdvs'

const fetchUserRdvInfo = async (user: PrismaSessionUser) => {
  const sessionUser = serializePrismaSessionUser(user)
  const rdvs = await getRdvs({
    user: sessionUser,
    onlyForUser: true,
  })

  return {
    rdvs,
    hasOauthTokens: !!sessionUser.rdvAccount?.hasOauthTokens,
  }
}

export const usersRDV = async (usersWithFeatureFlag: PrismaSessionUser[]) => {
  const data = await Promise.all(
    usersWithFeatureFlag.map(async (user: PrismaSessionUser) => ({
      user,
      ...(await fetchUserRdvInfo(user)),
    })),
  )

  return data
    .sort((a, b) => {
      return a.user.name?.localeCompare(b.user.name ?? '') ?? 0
    })
    .sort((a, b) => {
      return (b.hasOauthTokens ? 1 : 0) - (a.hasOauthTokens ? 1 : 0)
    })
    .sort((a, b) => {
      return b.rdvs.length - a.rdvs.length
    })
}
