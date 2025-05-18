import type { BeneficiaireRdv } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getBeneficiaireRdvsList'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { dateAsTime } from '@app/web/utils/dateAsDayAndTime'
import classNames from 'classnames'
import Badge from '@codegouvfr/react-dsfr/Badge'

const RdvBeneficiaireMediateurCard = ({
  activite,
  displayDate = false,
}: {
  activite: BeneficiaireRdv
  displayDate?: boolean
}) => {
  const now = new Date()
  const { date, agents, durationInMinutes } = activite

  const badge =
    date > now ? <Badge severity="new">RDV&nbsp;à&nbsp;venir</Badge> : null

  return (
    <div className="fr-py-2v fr-px-4v fr-flex fr-align-items-center fr-my-2v fr-enlarge-button fr-border-radius--8 fr-justify-content-start">
      <div className="fr-background-alt--blue-france fr-p-1v fr-border-radius--8 fr-flex fr-mr-4v">
        <img
          className="fr-display-block"
          alt=""
          src="/images/services/rdv-service-public.svg"
          style={{ width: 36, height: 36 }}
        />
      </div>
      <p className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-0 fr-whitespace-nowrap">
        Rendez-vous
      </p>
      <p className="fr-text--medium fr-text--sm fr-text-mention--grey fr-mb-0 fr-whitespace-nowrap">
        <span className="fr-mx-2v">·</span>
        {durationInMinutes}mn
      </p>
      <p className="fr-text--medium fr-text--sm fr-text-mention--grey fr-mb-0 fr-whitespace-nowrap">
        <span className="fr-mx-2v">·</span>
        <span className="fr-icon-user-line fr-mr-1w fr-icon--sm" />
        {agents.map(({ displayName }) => displayName).join(', ')}
      </p>
      {displayDate && (
        <p
          className={classNames(
            'fr-text--xs fr-text-mention--grey fr-text--bold fr-text--uppercase flex-1 fr-ml-auto fr-pl-3w fr-my-4v fr-whitespace-nowrap',
            displayDate && 'fr-ml-auto',
          )}
        >
          {dateAsDay(date)} à {dateAsTime(date)}
        </p>
      )}
      <span
        className={classNames(
          'fr-icon-more-line fr-pl-4v fr-text-title--blue-france',
          !displayDate && 'fr-ml-auto',
        )}
      />
      {badge}
    </div>
  )
}

export default RdvBeneficiaireMediateurCard
