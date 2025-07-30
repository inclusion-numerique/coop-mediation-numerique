import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import RdvServicePublicStatusTag from '@app/web/rdv-service-public/RdvServicePublicStatusTag'
import { numberToString } from '@app/web/utils/formatNumber'
import { usersRDV } from './db/usersRDV'
import { usersWithFeatureFlag } from './db/usersWithFeatureFlag'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'

export const AdministrationRDVSPPage = async () => {
  const users = await usersWithFeatureFlag()
  const sortedData = await usersRDV(users)

  return (
    <CoopPageContainer>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs
        parents={[
          {
            label: 'Fonctionnalités',
            linkProps: { href: `/administration/fonctionnalites` },
          },
        ]}
        currentPage="RDVSP"
      />
      <main id={contentId}>
        <AdministrationTitle icon="ri-calendar-check-line">
          Rendez-Vous Service Public
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
                    {users.length === 0 && (
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
      </main>
    </CoopPageContainer>
  )
}
