import { TruncateText } from '@app/ui/components/Primitives/TruncatedText'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import ActiviteCardOpenModalLink from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/ActiviteCardOpenModalLink'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import Stars from '@app/web/components/Stars'
import { niveauAtelierStars } from '@app/web/features/activites/use-cases/cra/collectif/fields/niveau-atelier'
import { thematiqueLabels } from '@app/web/features/activites/use-cases/cra/fields/thematique'
import {
  typeActiviteLabels,
  typeActivitePictograms,
} from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import { autonomieStars } from '@app/web/features/activites/use-cases/cra/individuel/fields/autonomie'
import type { ActiviteListItemWithTimezone } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { dureeAsString } from '@app/web/utils/dureeAsString'
import { Fragment } from 'react'
import ActiviteCardSpacer from './ActiviteCardSpacer'
import ListCard from './ListCard'

const MAX_THEMATIQUES_DISPLAYED = 2

type ActiviteCardProps = {
  activite: ActiviteListItemWithTimezone
  variant: 'with-beneficiaire' | 'without-beneficiaire'
  stacked?: boolean
  firstOfStack?: boolean
  lastOfStack?: boolean
  displayDateDay?: boolean
}

const ActiviteCard = ({
  activite,
  variant,
  stacked,
  firstOfStack,
  lastOfStack,
  displayDateDay,
}: ActiviteCardProps) => {
  const {
    type,
    titreAtelier,
    duree,
    accompagnements,
    date,
    thematiques,
    niveau,
    autonomie,
    rdvServicePublicId,
    rdv,
  } = activite

  const showRdvFooter = !!rdvServicePublicId || !!rdv

  const { hasStars, starsCount } =
    variant === 'without-beneficiaire'
      ? autonomie
        ? { hasStars: true, starsCount: autonomieStars[autonomie] }
        : niveau
          ? { hasStars: true, starsCount: niveauAtelierStars[niveau] }
          : { hasStars: false, starsCount: 0 }
      : { hasStars: false, starsCount: 0 }

  const thematiquesCount = thematiques.length
  const firstThematiques = thematiques.slice(0, MAX_THEMATIQUES_DISPLAYED)
  const hasMoreThematiques =
    thematiquesCount > MAX_THEMATIQUES_DISPLAYED
      ? thematiquesCount - MAX_THEMATIQUES_DISPLAYED
      : 0

  return (
    <ListCard
      enlargeButton
      pictogram={typeActivitePictograms[type]}
      stacked={stacked}
      firstOfStack={firstOfStack}
      lastOfStack={lastOfStack}
      contentTop={
        <>
          {typeActiviteLabels[type]}

          {titreAtelier ? (
            <>
              <ActiviteCardSpacer />
              <TruncateText text={titreAtelier} maxLength={40} />
            </>
          ) : null}
          {displayDateDay ? (
            <>
              <ActiviteCardSpacer />
              le {dateAsDay(date)}
            </>
          ) : null}
          {variant === 'with-beneficiaire' ? (
            <>
              <ActiviteCardSpacer />
              <span className="fr-icon-time-line fr-icon--xs" />
              &nbsp;
              {dureeAsString(duree)}
            </>
          ) : null}
        </>
      }
      contentBottom={
        <div className="fr-text--medium">
          {firstThematiques.map((thematique, index) => (
            <Fragment key={thematique}>
              {index > 0 && <ActiviteCardSpacer />}
              {thematiqueLabels[thematique]}
            </Fragment>
          ))}
          {hasMoreThematiques ? (
            <>
              <ActiviteCardSpacer />+{hasMoreThematiques}
            </>
          ) : null}
        </div>
      }
      actions={
        <>
          {hasStars && (
            <Stars count={starsCount} max={3} className="fr-mx-10v" />
          )}
          {variant === 'with-beneficiaire' ? (
            type === 'Collectif' ? (
              <>
                <span className="fr-icon-group-line fr-mr-1w fr-icon--sm" />
                {accompagnements.length}&nbsp;participant
                {sPluriel(accompagnements.length)}
              </>
            ) : (
              <>
                <span className="fr-icon-user-line fr-mr-1w fr-icon--sm" />
                <TruncateText
                  text={getBeneficiaireDisplayName(
                    accompagnements[0]?.beneficiaire ?? {},
                  )}
                  maxLength={20}
                />
              </>
            )
          ) : null}
          {variant === 'without-beneficiaire' ? (
            <div
              className="fr-flex fr-justify-content-start fr-align-items-center fr-flex-nowrap"
              style={{ width: 72, minWidth: 72 }}
            >
              <span className="fr-icon-time-line fr-icon--sm" />
              &nbsp;
              {dureeAsString(duree)}
            </div>
          ) : null}
          <ActiviteCardOpenModalLink activite={activite} />
        </>
      }
      footer={
        showRdvFooter ? (
          <div className="fr-text--xs fr-text-mention--grey fr-mb-0 fr-flex fr-align-items-center fr-mt-2v">
            <div
              className="fr-background-alt--blue-france fr-p-1v fr-border-radius--4 fr-flex fr-mr-1-5v"
              aria-hidden
            >
              <RDVServicePublicLogo
                className="fr-display-block"
                width={14}
                height={14}
              />
            </div>
            RDV pris via RDV&nbsp;Service&nbsp;Public
          </div>
        ) : null
      }
    />
  )
}

export default ActiviteCard
