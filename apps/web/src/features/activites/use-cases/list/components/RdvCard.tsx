import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import type { RdvListItem } from '@app/web/features/rdvsp/administration/db/rdvQueries'
import {
  dateAsDayInTimeZone,
  dateAsTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { numberToString } from '@app/web/utils/formatNumber'
import { UserRdvAccount, UserTimezone } from '@app/web/utils/user'
import Button from '@codegouvfr/react-dsfr/Button'
import ActiviteCardSpacer from './ActiviteCardSpacer'
import ActiviteOrRdvListCard from './ActiviteOrRdvListCard'
import CraFromRdvButton from './CraFromRdvButton'
import RdvStatusBadge from './RdvStatusBadge'

const RdvCard = ({
  rdv,
  user,
  displayBeneficiaire,
  displayDate,
}: {
  rdv: RdvListItem
  user: UserRdvAccount & UserTimezone
  displayBeneficiaire?: boolean
  displayDate?: boolean
}) => {
  const { timezone } = user

  const {
    startsAt,
    endsAt,
    motif,
    maxParticipantsCount,
    participations,
    urlForAgents,
    status,
    badgeStatus,
  } = rdv

  const participants = participations.map((participation) => participation.user)

  const participantsNames = participants
    .map((participant) =>
      getBeneficiaireDisplayName({
        nom: participant.lastName,
        prenom: participant.firstName,
      }),
    )
    .join(', ')

  const startTime = dateAsTimeInTimeZone(startsAt, timezone)
  const endTime = dateAsTimeInTimeZone(endsAt, timezone)
  const canCompleteCra = status === 'seen'

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
              le {dateAsDayInTimeZone(startsAt, timezone)}
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
            {motif?.name}{' '}
            {motif?.collectif && rdv.name ? <>{rdv.name} </> : null}
            {motif?.collectif ? (
              maxParticipantsCount ? (
                <>({numberToString(maxParticipantsCount)} places)</>
              ) : null
            ) : (
              <>avec {participantsNames}</>
            )}
          </>
        ) : (
          motif?.name
        )
      }
      actions={
        <>
          <RdvStatusBadge rdv={rdv} className="fr-mr-2v" />
          {canCompleteCra ? (
            <CraFromRdvButton className="fr-flex-shrink-0" rdvId={rdv.id} />
          ) : (
            <Button
              priority="tertiary no outline"
              size="small"
              className="fr-flex-shrink-0"
              title="Voir et modifier le RDV sur Rendez-vous Service Public"
              linkProps={{
                href: urlForAgents,
                target: '_blank',
              }}
            >
              {badgeStatus === 'past' ? 'À valider sur RDVSP' : 'Voir'}
            </Button>
          )}
        </>
      }
    />
  )
}

export default RdvCard
