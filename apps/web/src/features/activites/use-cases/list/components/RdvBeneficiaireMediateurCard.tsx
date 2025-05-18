import type { BeneficiaireRdv } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getBeneficiaireRdvsList'
import { SessionUser } from '@app/web/auth/sessionUser'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { dateAsTime } from '@app/web/utils/dateAsDayAndTime'
import Badge from '@codegouvfr/react-dsfr/Badge'
import classNames from 'classnames'
import ActiviteOrRdvListCard from './ActiviteOrRdvListCard'
import { partition } from 'lodash-es'
import Button from '@codegouvfr/react-dsfr/Button'

const RdvBeneficiaireMediateurCard = ({
  activite,
  user,
}: {
  activite: BeneficiaireRdv
  displayDate?: boolean
  user: SessionUser
}) => {
  const userRdvAgentId = user.rdvAccount?.id

  const now = new Date()
  const { date, agents, durationInMinutes, motif, participations, url } =
    activite

  const _agentIsUser = agents.some((agent) => agent.id === userRdvAgentId)

  const participants = participations.map((participation) => participation.user)

  const participantsNames = participants
    .map((participant) => participant.displayName)
    .join(', ')

  const badge =
    date > now ? <Badge severity="new">RDV&nbsp;à&nbsp;venir</Badge> : null

  const startTime = dateAsTime(date)
  const endTime = dateAsTime(
    new Date(date.getTime() + durationInMinutes * 1000 * 60),
  )

  return (
    <ActiviteOrRdvListCard
      illustrationSrc="/images/services/rdv-service-public.svg"
      contentTop={
        <>
          Rendez-vous&nbsp;·&nbsp;
          <span className="fr-icon-time-line fr-icon--sm " />
          &nbsp;
          {startTime}&nbsp;-&nbsp;{endTime}
        </>
      }
      contentBottom={
        <>
          {motif.name} avec {participantsNames}
        </>
      }
      actions={
        <>
          {badge}
          <Button
            priority="tertiary no outline"
            linkProps={{
              href: url,
              target: '_blank',
            }}
          >
            Voir
          </Button>
        </>
      }
    />
  )
}

export default RdvBeneficiaireMediateurCard
