import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import {
  PrismaSessionUser,
  sessionUserSelect,
} from '@app/web/auth/getSessionUserFromSessionToken'
import { serializePrismaSessionUser } from '@app/web/auth/serializePrismaSessionUser'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import RdvServicePublicStatusTag from '@app/web/rdv-service-public/RdvServicePublicStatusTag'
import { getRdvs } from '@app/web/rdv-service-public/getRdvs'
import { numberToString } from '@app/web/utils/formatNumber'

export const metadata = {
  title: metadataTitle('Beta RDVSP'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

const Page = async () => {
  const usersWithFeatureFlag = await prismaClient.user.findMany({
    where: {
      featureFlags: { has: 'RdvServicePublic' },
    },
    select: sessionUserSelect,
    orderBy: {
      name: 'asc',
    },
  })

  const data = await Promise.all(
    usersWithFeatureFlag.map(async (user) => ({
      user,
      ...(await fetchUserRdvInfo(user)),
    })),
  )

  const sortedData = data
    .sort((a, b) => {
      return a.user.name?.localeCompare(b.user.name ?? '') ?? 0
    })
    .sort((a, b) => {
      return (b.hasOauthTokens ? 1 : 0) - (a.hasOauthTokens ? 1 : 0)
    })
    .sort((a, b) => {
      return b.rdvs.length - a.rdvs.length
    })

  return (
    <CoopPageContainer>
      <AdministrationBreadcrumbs currentPage="Beta RDVSP" />
      <AdministrationTitle icon="ri-calendar-check-line">
        Beta Rendez-Vous Service Public
      </AdministrationTitle>
      <p>Utilisateurs de la beta test</p>

      <div className="fr-table" data-fr-js-table="true">
        <div className="fr-table__wrapper">
          <div className="fr-table__container">
            <div className="fr-table__content">
              <table data-fr-js-table-element="true">
                <thead>
                  <tr>
                    <th scope="col">Utilisateur</th>
                    <th scope="col">Email</th>
                    <th scope="col">Intégration</th>
                    <th scope="col">Rendez-vous</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map(
                    ({ user: { id, name, email }, rdvs, hasOauthTokens }) => (
                      <tr key={id}>
                        <th>{name}</th>
                        <td>{email}</td>
                        <td>
                          <RdvServicePublicStatusTag
                            status={hasOauthTokens ? 'success' : 'error'}
                            small
                          />
                        </td>
                        <td>{numberToString(rdvs.length)}</td>
                      </tr>
                    ),
                  )}
                  {usersWithFeatureFlag.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        Aucun utilisateur n’est dans la beta test
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </CoopPageContainer>
  )
}

export default Page
