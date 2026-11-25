import { Button } from '@codegouvfr/react-dsfr/Button'
import { statutIntegration } from '@/features/rdvsp/domain/compte/sante-compte'
import RdvServicePublicStatusTag from '@/features/rdvsp/ui/components/RdvServicePublicStatusTag'
import { hrefDuCompteRdvEnAdministration } from '@/features/rdvsp/ui/presenters/liens.presenter'
import { dateAsDayAndTimeInTimeZone } from '@/libraries/date'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { numberToString } from '@/libraries/nombre'
import { pluriel } from '@/libraries/pluriel'
import {
  AdministrationBreadcrumbs,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'
import type { ComptesAdministres } from '../../domain/comptes-administres'

const AdministrationRdvspPage = async ({
  data: { users, rdvs },
  timezone = 'Europe/Paris',
}: {
  data: ComptesAdministres
  timezone?: string
}) => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs currentPage="RDVSP" />
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
                      sante,
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
                            status={statutIntegration(sante)}
                            small
                          />
                          <br />
                          <span className="fr-text--xs fr-text-mention--grey">
                            {numberToString(organisations.length)}{' '}
                            {pluriel(
                              organisations.length,
                              'organisation',
                              'organisations',
                            )}
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
                              href: hrefDuCompteRdvEnAdministration(id),
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
