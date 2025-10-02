import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import RdvStatusBadge from '@app/web/features/activites/use-cases/list/components/RdvStatusBadge'
import { DashboardRdvData } from '@app/web/features/rdvsp/queries/getDashboardRdvData'
import { rdvServicePublicRdvsLink } from '@app/web/rdv-service-public/rdvServicePublicOauth'
import { dateAsDayFullWordsInTimezone } from '@app/web/utils/dateAsDay'
import { dateAsTimeInTimeZone } from '@app/web/utils/dateAsDayAndTime'
import { numberToString } from '@app/web/utils/formatNumber'
import type { UserTimezone } from '@app/web/utils/user'
import Button from '@codegouvfr/react-dsfr/Button'
import * as Sentry from '@sentry/nextjs'
import classNames from 'classnames'
import styles from './Rdvs.module.css'
import RdvsHeader from './RdvsHeader'

const Rdvs = async ({
  rdvs: rdvsPromise,
  user: { timezone },
}: {
  rdvs: Promise<DashboardRdvData | null>
  user: UserTimezone
}) => {
  const rdvs = await rdvsPromise.catch((error) => {
    Sentry.captureException(error)
    return null
  })
  if (!rdvs) {
    return (
      <>
        <RdvsHeader />
        <p className="fr-text--sm fr-text-error fr-mb-0">
          Une erreur est survenue lors de la récupération des données de
          rendez-vous.
        </p>
      </>
    )
  }
  const { futur, honores, next, passes, organisation } = rdvs
  const nextBeneficiaire = next?.participations.at(0)?.user
  const nextBeneficiaireDisplayName = nextBeneficiaire
    ? getBeneficiaireDisplayName({
        prenom: nextBeneficiaire.first_name,
        nom: nextBeneficiaire.last_name,
      })
    : null

  return (
    <>
      <RdvsHeader />
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
                      href: '/coop/mes-activites?rdvs=unknown',
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
                ? `Prochain le ${dateAsDayFullWordsInTimezone(new Date(next.starts_at), timezone)}
               de ${dateAsTimeInTimeZone(new Date(next.starts_at), timezone)} à ${dateAsTimeInTimeZone(
                 new Date(
                   new Date(next.starts_at).getTime() +
                     next.duration_in_min * 1000 * 60,
                 ),
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
                      href: '/coop/mes-activites?rdvs=seen',
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

export default Rdvs
