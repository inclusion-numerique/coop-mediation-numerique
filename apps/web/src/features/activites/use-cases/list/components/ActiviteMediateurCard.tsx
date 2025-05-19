import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import ActiviteCardOpenModalLink from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/ActiviteCardOpenModalLink'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { thematiqueLabels } from '@app/web/features/activites/use-cases/cra/fields/thematique'
import { formatActiviteDayDate } from '@app/web/utils/activiteDayDateFormat'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { dureeAsString } from '@app/web/utils/dureeAsString'
import classNames from 'classnames'
import {
  typeActiviteIllustrations,
  typeActiviteLabels,
} from '../../cra/fields/type-activite'
import { ActiviteForList } from '../db/activitesQueries'
import ActiviteOrRdvListCard from './ActiviteOrRdvListCard'

const MAX_THEMATIQUES_DISPLAYED = 2

/**
 * Affiche une Activité dans le contexte d'un médiateur
 */
const ActiviteMediateurCard = ({
  activite,
}: {
  activite: ActiviteForList
}) => {
  const { type, titreAtelier, duree, accompagnements, date, thematiques } =
    activite

  const spacer = <span className="fr-mx-2v">·</span>

  const thematiquesCount = thematiques.length
  const firstThematiques = thematiques.slice(0, MAX_THEMATIQUES_DISPLAYED)
  const hasMoreThematiques =
    thematiquesCount > MAX_THEMATIQUES_DISPLAYED
      ? thematiquesCount - MAX_THEMATIQUES_DISPLAYED
      : 0

  return (
    <ActiviteOrRdvListCard
      enlargeButton
      illustrationSrc={typeActiviteIllustrations[type] ?? ''}
      contentTop={
        <>
          {typeActiviteLabels[type]}
          {spacer}
          {titreAtelier ? (
            <>
              {titreAtelier}
              {spacer}
            </>
          ) : null}
          le {dateAsDay(date)}
          {spacer}
          <span className="fr-icon-time-line fr-icon--xs" />
          &nbsp;
          {dureeAsString(duree)}
        </>
      }
      contentBottom={
        <div className="fr-text--medium">
          {firstThematiques.map((thematique, index) => (
            <>
              {index > 0 && spacer}
              {thematiqueLabels[thematique]}
            </>
          ))}
          {hasMoreThematiques ? (
            <>
              {spacer}+{hasMoreThematiques}
            </>
          ) : null}
        </div>
      }
      actions={
        <>
          {type === 'Collectif' ? (
            <>
              <span className="fr-icon-group-line fr-mr-1w fr-icon--sm" />
              {accompagnements.length}&nbsp;participant
              {sPluriel(accompagnements.length)}
            </>
          ) : (
            <>
              <span className="fr-icon-user-line fr-mr-1w fr-icon--sm" />
              {getBeneficiaireDisplayName(
                accompagnements[0]?.beneficiaire ?? {},
              )}
            </>
          )}
          <ActiviteCardOpenModalLink activite={activite} />
        </>
      }
    />
  )
}

export default ActiviteMediateurCard
