import RdvStatusBadge from '@app/web/features/activites/use-cases/list/components/RdvStatusBadge'
import { rdvServicePublicRdvsLink } from '@app/web/rdv-service-public/rdvServicePublicOauth'
import { dateAsDayFullWordsInTimezone } from '@app/web/utils/dateAsDay'
import { dateAsTimeInTimeZone } from '@app/web/utils/dateAsDayAndTime'
import type { UserTimezone } from '@app/web/utils/user'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import Link from 'next/link'
import type { AccueilRdvsData } from '../getAccueilPageDataFor'
import styles from './Rdvs.module.css'

const Rdvs = ({
  rdvs: { futur, honores, next, passes },
  user: { timezone },
}: { rdvs: AccueilRdvsData; user: UserTimezone }) => (
  <>
    <div className="fr-flex fr-flex-wrap fr-align-items-center fr-justify-content-space-between fr-mb-3w">
      <div className="fr-background-alt--blue-france fr-p-1-5v fr-border-radius--8 fr-flex fr-mr-1w">
        <img
          className="fr-display-block"
          alt=""
          src="/images/services/rdv-service-public.svg"
          style={{ width: 28, height: 28 }}
        />
      </div>
      <h2 className="fr-h5 fr-text-mention--grey fr-mb-0">
        RDV Service Public
      </h2>
      <span className="fr-flex-grow-1" />
      <Link
        className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
        href="/coop/mes-activites?rdvs=tous"
      >
        Voir tous mes rendez-vous
      </Link>
    </div>

    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-6">
        <div className="fr-border-radius--16 fr-border fr-p-6v fr-height-full">
          <div className="fr-flex fr-align-items-center fr-flex-gap-4v">
            <p
              className={classNames(
                'fr-h3 fr-text fr-mb-0 fr-text-title--blue-france',
                futur.length === 0 && styles.disabled,
              )}
            >
              {futur.length}
            </p>
            <RdvStatusBadge
              className={classNames(
                futur.length === 0 && styles.disabled,
                futur.length === 0 && styles.disabledBackground,
              )}
              rdv={{ badgeStatus: 'unknown' }}
              pluralize={futur.length}
            />
            {futur.length > 0 && (
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
              ? `Prochain le ${dateAsDayFullWordsInTimezone(next.date, timezone)}
               de ${dateAsTimeInTimeZone(next.date, timezone)} à ${dateAsTimeInTimeZone(
                 new Date(
                   next.date.getTime() + next.durationInMinutes * 1000 * 60,
                 ),
                 timezone,
               )}
                avec ${next.participations.at(0)?.user.displayName ?? 'anonyme'}`
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
                passes.length === 0 && styles.disabled,
              )}
            >
              {passes.length}
            </p>
            <RdvStatusBadge
              className={classNames(
                passes.length === 0 && styles.disabled,
                passes.length === 0 && styles.disabledBackground,
              )}
              rdv={{ badgeStatus: 'past' }}
              pluralize={passes.length}
            />
            {passes.length > 0 && (
              <>
                <span className="fr-flex-grow-1" />
                <Button
                  priority="tertiary no outline"
                  size="small"
                  linkProps={{
                    href: rdvServicePublicRdvsLink({
                      organisationId: passes[0].organisation.id,
                    }),
                    target: '_blank',
                  }}
                >
                  À valider sur RDV SP
                </Button>
              </>
            )}
          </div>
          <hr className="fr-separator-6v" />
          <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
            <p
              className={classNames(
                'fr-h4 fr-text fr-mb-0 fr-text-title--blue-france fr-pr-2v',
                honores.length === 0 && styles.disabled,
              )}
            >
              {honores.length}
            </p>
            <RdvStatusBadge
              className={classNames(
                honores.length === 0 && styles.disabled,
                honores.length === 0 && styles.disabledBackground,
              )}
              rdv={{ badgeStatus: 'seen' }}
              pluralize={honores.length}
            />
            {honores.length > 0 && (
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

export default Rdvs
