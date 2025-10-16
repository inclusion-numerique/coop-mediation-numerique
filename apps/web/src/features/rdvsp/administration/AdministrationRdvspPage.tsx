import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import RdvServicePublicStatusTag from '@app/web/rdv-service-public/RdvServicePublicStatusTag'
import { dateAsDayAndTimeInTimeZone } from '@app/web/utils/dateAsDayAndTime'
import { numberToString } from '@app/web/utils/formatNumber'
import { contentId } from '@app/web/utils/skipLinks'
import { Button } from '@codegouvfr/react-dsfr/Button'
import type { AdministrationRdvspData } from './getAdministrationRdvspData'

const AdministrationRdvspPage = async ({
  data: { users, rdvs },
  timezone = 'Europe/Paris',
}: {
  data: AdministrationRdvspData
  timezone?: string
}) => (
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
      <p className="fr-mb-2v">
        <span className="fr-text--bold">{numberToString(users.length)}</span>{' '}
        utilisateurs connectés à RDVSP
      </p>
      <p>
        <span className="fr-text--bold">{numberToString(rdvs.total)}</span>{' '}
        rendez-vous synchronisés
      </p>
      <div className="fr-table" data-fr-js-table="true">
        <div className="fr-table__wrapper">
          <div className="fr-table__container">
            <div className="fr-table__content">
              <table data-fr-js-table-element="true">
                <thead>
                  <tr>
                    <th scope="col">Utilisateur</th>
                    <th scope="col">Intégration</th>
                    <th scope="col">Rendez-vous</th>
                    <th scope="col">Dernière synchronisation</th>
                    <th scope="col">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(
                    ({
                      id,
                      name,
                      email,
                      hasOauthTokens,
                      rdvAccount: {
                        organisations,
                        lastSync,
                        _count: { rdvs },
                      },
                    }) => (
                      <tr key={id}>
                        <td className="fr-text--sm">
                          {name}
                          <br />
                          <span className="fr-text-mention--grey fr-text--xs">
                            {email}
                          </span>
                        </td>
                        <td>
                          <RdvServicePublicStatusTag
                            status={hasOauthTokens ? 'success' : 'error'}
                            small
                          />
                          <br />
                          <span className="fr-text--xs fr-text-mention--grey">
                            {numberToString(organisations.length)} organisation
                            {sPluriel(organisations.length)}
                          </span>
                        </td>
                        <td>{numberToString(rdvs)}</td>
                        <td>
                          {lastSync ? (
                            <>
                              {dateAsDayAndTimeInTimeZone(
                                lastSync.started,
                                timezone,
                              )}{' '}
                              {!!lastSync.ended &&
                                typeof lastSync.duration === 'number' &&
                                `(${numberToString(lastSync.duration)}s)`}
                              <br />
                              {!lastSync.error && !!lastSync.drift && (
                                <span className="fr-text--error fr-text--xs fr-mb-0">
                                  🚨 {numberToString(lastSync.drift)} drift
                                </span>
                              )}
                              {!lastSync.error && !lastSync.drift && (
                                <span className="fr-text--xs fr-mb-0">
                                  <span className="fr-icon fr-icon--sm fr-icon-check-line fr-text--success" />{' '}
                                  Pas de drift
                                </span>
                              )}
                              {lastSync.error && (
                                <span className="fr-text--error fr-text--xs fr-mb-0">
                                  ⚠️ La synchronisation a échoué
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="fr-text--error fr-text--xs fr-mb-0">
                              Aucune
                            </span>
                          )}
                        </td>
                        <td>
                          <Button
                            linkProps={{
                              href: `/administration/fonctionnalites/rdvsp/${id}`,
                            }}
                            size="small"
                            title="Détails sur l’integration RDVSP"
                            iconId="fr-icon-eye-line"
                            priority="tertiary"
                          />
                        </td>
                      </tr>
                    ),
                  )}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4}>Aucun utilisateur n’utilise RDVSP</td>
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

export default AdministrationRdvspPage
