import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import type { Rdv } from '@app/web/rdv-service-public/Rdv'
import {
  dateAsDayInTimeZone,
  dateAsTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { UserRdvAccount, UserTimezone } from '@app/web/utils/user'
import Button from '@codegouvfr/react-dsfr/Button'
import ActiviteCardSpacer from './ActiviteCardSpacer'
import ActiviteOrRdvListCard from './ActiviteOrRdvListCard'
import RdvStatusBadge from './RdvStatusBadge'

const RdvCard = ({
  activite,
  user,
  displayBeneficiaire,
  displayDate,
}: {
  activite: Rdv
  user: UserRdvAccount & UserTimezone
  displayBeneficiaire?: boolean
  displayDate?: boolean
}) => {
  const userRdvAgentId = user.rdvAccount?.id

  const { timezone } = user

  const now = Date.now()
  const {
    date,
    endDate,
    agents,
    motif,
    participations,
    url,
    status,
    badgeStatus,
  } = activite

  // TODO display if rdv has been created by another agent ?
  const _agentIsUser = agents.some((agent) => agent.id === userRdvAgentId)

  const participants = participations.map((participation) => participation.user)

  const participantsNames = participants
    .map((participant) => participant.displayName)
    .join(', ')

  const startTime = dateAsTimeInTimeZone(date, timezone)
  const endTime = dateAsTimeInTimeZone(endDate, timezone)
  const canCompleteCra = status === 'seen' && date.getTime() < now

  const newCraLink = canCompleteCra
    ? `/coop/mes-activites/convertir-rdv-en-cra?rdv=${encodeSerializableState(activite)}`
    : ''

  return (
    <ActiviteOrRdvListCard
      pictogram={RDVServicePublicLogo}
      enlargeLink
      contentTop={
        <>
          Rendez-vous
          <ActiviteCardSpacer />
          {displayDate && (
            <>
              le {dateAsDayInTimeZone(date, timezone)}
              <ActiviteCardSpacer />
            </>
          )}
          <span className="fr-icon-time-line fr-icon--xs " />
          &nbsp;
          {startTime}&nbsp;à&nbsp;{endTime}
        </>
      }
      contentBottom={
        displayBeneficiaire ? (
          <>
            {motif.name} avec {participantsNames}
          </>
        ) : (
          motif.name
        )
      }
      actions={
        <>
          <RdvStatusBadge rdv={activite} className="fr-mr-2v" />
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
              {badgeStatus === 'past' ? 'À valider sur RDV SP' : 'Voir'}
            </Button>
          )}
        </>
      }
    />
  )
}

export default RdvCard
