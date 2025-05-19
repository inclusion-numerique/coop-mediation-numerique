import type { BeneficiaireRdv } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getBeneficiaireRdvsList'
import type { OAuthApiRdvStatus } from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { dateAsTime } from '@app/web/utils/dateAsDayAndTime'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { UserRdvAccount } from '@app/web/utils/user'
import type { AlertProps } from '@codegouvfr/react-dsfr/Alert'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { DefaultValues } from 'react-hook-form'
import { CraIndividuelData } from '../../cra/individuel/validation/CraIndividuelValidation'
import ActiviteOrRdvListCard from './ActiviteOrRdvListCard'

type RdvStatusBadgeVariant = OAuthApiRdvStatus | 'past'
const statusBadgeProps: {
  [key in RdvStatusBadgeVariant]: {
    severity: AlertProps.Severity | 'new'
    label: string
  }
} = {
  unknown: {
    severity: 'new',
    label: 'À venir',
  },
  seen: {
    severity: 'success',
    label: 'Honoré',
  },
  noshow: {
    severity: 'error',
    label: 'Absence',
  },
  excused: {
    severity: 'warning',
    label: 'Annulé par bénéficiaire',
  },
  revoked: {
    severity: 'warning',
    label: 'Annulé',
  },
  past: {
    severity: 'info',
    label: 'Passé',
  },
}

const createCraUrlFromRdv = ({
  date,
  durationInMinutes,
  participations,
}: BeneficiaireRdv) => {
  const participationBeneficiaireSuivi = participations.find(
    (participation) => !!participation.user.beneficiaire,
  )

  const defaultValues: DefaultValues<CraIndividuelData> = {
    date: dateAsIsoDay(date),
    duree: {
      dureePersonnaliseeMinutes: durationInMinutes,
      duree: 'personnaliser',
    },
    beneficiaire: participationBeneficiaireSuivi?.user.beneficiaire
      ? { id: participationBeneficiaireSuivi.user.beneficiaire.id }
      : undefined,
  }

  return `/coop/mes-activites/cra/individuel?v=${encodeSerializableState(defaultValues)}`
}

const RdvBeneficiaireMediateurCard = ({
  activite,
  user,
}: {
  activite: BeneficiaireRdv
  displayDate?: boolean
  user: UserRdvAccount
}) => {
  const userRdvAgentId = user.rdvAccount?.id

  const now = new Date()
  const {
    date,
    agents,
    durationInMinutes,
    motif,
    participations,
    url,
    status,
  } = activite

  // TODO display if rdv has been created by another agent ?
  const _agentIsUser = agents.some((agent) => agent.id === userRdvAgentId)

  const participants = participations.map((participation) => participation.user)

  const participantsNames = participants
    .map((participant) => participant.displayName)
    .join(', ')

  const badgeVariant: RdvStatusBadgeVariant =
    status === 'unknown' && date < now ? 'past' : status
  const badge = (
    <Badge small severity={statusBadgeProps[badgeVariant].severity}>
      {statusBadgeProps[badgeVariant].label}
    </Badge>
  )

  const startTime = dateAsTime(date)
  const endTime = dateAsTime(
    new Date(date.getTime() + durationInMinutes * 1000 * 60),
  )

  const canCompleteCra = badgeVariant === 'seen'

  const newCraLink = canCompleteCra ? createCraUrlFromRdv(activite) : ''

  return (
    <ActiviteOrRdvListCard
      illustrationSrc="/images/services/rdv-service-public.svg"
      enlargeLink
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
          {canCompleteCra ? (
            <Button
              priority="tertiary no outline"
              size="small"
              linkProps={{
                href: newCraLink,
              }}
              title="Compléter un CRA à partir de ce RDV"
            >
              {/* Layout is broken with fr-enlarge-link if icon is in button props, we put it in the title instead */}
              <span className="fr-icon-edit-line fr-icon--sm fr-mr-1-5v" />{' '}
              Compléter un CRA
            </Button>
          ) : (
            <Button
              priority="tertiary no outline"
              size="small"
              title="Voir et modifier le RDV sur Rendez-vous Service Public"
              linkProps={{
                href: url,
                target: '_blank',
              }}
            >
              Voir
            </Button>
          )}
        </>
      }
    />
  )
}

export default RdvBeneficiaireMediateurCard
