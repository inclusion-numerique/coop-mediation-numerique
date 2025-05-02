import type { BeneficiaireRdv } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getBeneficiaireRdvsList'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { dateAsTime } from '@app/web/utils/dateAsDayAndTime'
import Badge from '@codegouvfr/react-dsfr/Badge'

const ActiviteRdvBeneficiaireCard = ({
  activite,
}: {
  activite: BeneficiaireRdv
}) => {
  const now = new Date()

  const { date, agents, durationInMinutes } = activite

  const badge =
    date > now ? <Badge severity="new">RDV&nbsp;à&nbsp;venir</Badge> : null

  return (
    <div className="fr-py-2v fr-px-4v fr-flex fr-align-items-center fr-flex-gap-4v fr-my-2v fr-enlarge-button fr-border-radius--8">
      <div className="fr-background-alt--blue-france fr-p-2v fr-border-radius--8 fr-flex">
        <img
          className="fr-display-block"
          alt=""
          src="/images/services/rdv-service-public.svg"
          style={{ width: 40, height: 40 }}
        />
      </div>
      <div className="fr-flex-grow-1">
        <p className=" fr-mb-2v">
          <span className="fr-text--xs fr-text-mention--grey  fr-mb-0">
            Rendez-vous de {durationInMinutes}mn planifié&nbsp;·&nbsp;le{' '}
            {dateAsDay(date)} à {dateAsTime(date)} par{' '}
            {agents.map(({ displayName }) => displayName).join(', ')}
          </span>
        </p>
        <div className="fr-flex fr-align-items-center fr-justify-content-start">
          {badge}
        </div>
      </div>
      {/*TODO MODAL (see activite card) */}
      {/*<span className="fr-icon-more-line fr-pl-2v fr-ml-auto fr-text-title--blue-france" />*/}
    </div>
  )
}

export default ActiviteRdvBeneficiaireCard
