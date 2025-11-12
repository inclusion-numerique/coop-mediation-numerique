'use client'

import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import RdvStatusBadge from '@app/web/features/activites/use-cases/list/components/RdvStatusBadge'
import { DashboardRdvData } from '@app/web/features/rdvsp/queries/getDashboardRdvData'
import { rdvServicePublicRdvsLink } from '@app/web/rdv-service-public/rdvServicePublicUrls'
import { trpc } from '@app/web/trpc'
import { dateAsDayFullWordsInTimezone } from '@app/web/utils/dateAsDay'
import { dateAsTimeInTimeZone } from '@app/web/utils/dateAsDayAndTime'
import { numberToString } from '@app/web/utils/formatNumber'
import type { UserId, UserTimezone } from '@app/web/utils/user'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import styles from './Rdvs.module.css'
import RdvsHeader from './RdvsHeader'

const Rdvs = ({
  rdvs: initialRdvs,
  user: { timezone, id: userId },
  syncDataOnLoad,
}: {
  rdvs: DashboardRdvData | null
  user: UserId & UserTimezone
  syncDataOnLoad: boolean
}) => {
  const [dashboardRdvData, setDashboardRdvData] =
    useState<DashboardRdvData | null>(initialRdvs)

  const mutation = trpc.rdvServicePublic.refreshDashboardRdvData.useMutation()

  // Trigger a refresh on component mount if needed
  // biome-ignore lint/correctness/useExhaustiveDependencies: mutation is not in dependencies as it should not retrigger the call
  useEffect(() => {
    if (syncDataOnLoad) {
      mutation
        .mutateAsync({ userId })
        .then(({ dashboardRdvData, hasDiff }) =>
          hasDiff ? setDashboardRdvData(dashboardRdvData) : null,
        )
    }
  }, [syncDataOnLoad])

  if (!dashboardRdvData) {
    return (
      <>
        <RdvsHeader isLoading={false} />
        <p className="fr-text--sm fr-text-error fr-mb-0">
          Une erreur est survenue lors de la récupération des données de
          rendez-vous.
        </p>
      </>
    )
  }

  const isLoading = mutation.isPending

  const { futur, honores, next, passes, organisation } = dashboardRdvData
  const nextBeneficiaire = next?.participations.at(0)?.user
  const nextBeneficiaireDisplayName = nextBeneficiaire
    ? getBeneficiaireDisplayName({
        prenom: nextBeneficiaire.firstName,
        nom: nextBeneficiaire.lastName,
      })
    : null

  return (
    <>
      <RdvsHeader isLoading={isLoading} />
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-6">
          <div className="fr-border-radius--16 fr-border fr-p-6v fr-height-full">
            <div className="fr-flex fr-align-items-center fr-flex-gap-4v">
              <p
                className={classNames(
                  'fr-h3 fr-text fr-mb-0 fr-text-title--blue-france',
                  futur === 0 && styles.disabled,
                )}
              >
                {numberToString(futur)}
              </p>
              <RdvStatusBadge
                className={classNames(
                  futur === 0 && styles.disabled,
                  futur === 0 && styles.disabledBackground,
                )}
                rdv={{ badgeStatus: 'unknown' }}
                pluralize={futur}
              />
              {futur > 0 && (
                <>
                  <span className="fr-flex-grow-1" />
                  <Button
                    iconId="fr-icon-arrow-right-line"
                    iconPosition="right"
                    priority="tertiary no outline"
                    size="small"
                    linkProps={{
                      href: '/coop/mes-activites?rdvs=unknown&voir-rdvs=1',
                    }}
                  >
                    Voir
                  </Button>
                </>
              )}
            </div>
            <p
              className={classNames(
                'fr-text--sm fr-mt-4v fr-mb-0 fr-text--medium',
                !next && styles.disabled,
              )}
            >
              {next
                ? `Prochain le ${dateAsDayFullWordsInTimezone(new Date(next.startsAt), timezone)}
               de ${dateAsTimeInTimeZone(new Date(next.startsAt), timezone)} à ${dateAsTimeInTimeZone(
                 new Date(next.endsAt),
                 timezone,
               )}
                avec ${nextBeneficiaireDisplayName ?? 'anonyme'}`
                : 'Vous n’avez pas de rendez-vous à venir'}
            </p>
          </div>
        </div>
        <div className="fr-col-6">
          <div className="fr-border-radius--16 fr-border fr-p-6v fr-height-full">
            <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
              <p
                className={classNames(
                  'fr-h4 fr-text fr-mb-0 fr-text-title--blue-france fr-pr-2v',
                  passes === 0 && styles.disabled,
                )}
              >
                {numberToString(passes)}
              </p>
              <RdvStatusBadge
                className={classNames(
                  passes === 0 && styles.disabled,
                  passes === 0 && styles.disabledBackground,
                )}
                rdv={{ badgeStatus: 'past' }}
                pluralize={passes}
              />
              {passes > 0 && (
                <>
                  <span className="fr-flex-grow-1" />
                  <Button
                    priority="tertiary no outline"
                    size="small"
                    linkProps={{
                      href: rdvServicePublicRdvsLink({
                        organisationId: organisation.id,
                        status: 'unknown_past',
                      }),
                      target: '_blank',
                    }}
                  >
                    À valider sur RDV&nbsp;SP
                  </Button>
                </>
              )}
            </div>
            <hr className="fr-separator-6v" />
            <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
              <p
                className={classNames(
                  'fr-h4 fr-text fr-mb-0 fr-text-title--blue-france fr-pr-2v',
                  honores === 0 && styles.disabled,
                )}
              >
                {numberToString(honores)}
              </p>
              <RdvStatusBadge
                className={classNames(
                  honores === 0 && styles.disabled,
                  honores === 0 && styles.disabledBackground,
                )}
                rdv={{ badgeStatus: 'seen' }}
                pluralize={honores}
              />
              {honores > 0 && (
                <>
                  <span className="fr-flex-grow-1" />
                  <Button
                    iconId="fr-icon-arrow-right-line"
                    iconPosition="right"
                    priority="tertiary no outline"
                    size="small"
                    linkProps={{
                      href: '/coop/mes-activites?rdvs=seen&voir-rdvs=1',
                    }}
                  >
                    CRA à compléter
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default withTrpc(Rdvs)
