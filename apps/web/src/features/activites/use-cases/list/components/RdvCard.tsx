'use client'

import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { RdvStatusUpdateDynamicModal } from '@app/web/features/activites/use-cases/list/components/RdvStatusUpdateModal/RdvStatusUpdateModal'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import type { RdvListItem } from '@app/web/features/rdvsp/administration/db/rdvQueries'
import {
  dateAsDayInTimeZone,
  dateAsTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'
import { numberToString } from '@app/web/utils/formatNumber'
import { UserRdvAccount, UserTimezone } from '@app/web/utils/user'
import Button from '@codegouvfr/react-dsfr/Button'
import ActiviteCardSpacer from './ActiviteCardSpacer'
import CraFromRdvButton from './CraFromRdvButton'
import ListCard from './ListCard'
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
  const openStatusUpdateModal = RdvStatusUpdateDynamicModal.useOpen()

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

  const handleOpenStatusModal = () => {
    openStatusUpdateModal({ rdv })
  }

  return (
    <ListCard
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
          ) : badgeStatus === 'past' ? (
            <Button
              priority="tertiary no outline"
              size="small"
              className="fr-flex-shrink-0"
              title="Renseigner le statut du RDV"
              onClick={handleOpenStatusModal}
            >
              À renseigner
            </Button>
          ) : (
            <Button
              priority="tertiary no outline"
              size="small"
              className="fr-flex-shrink-0"
              title="Voir et modifier le RDV"
              linkProps={{
                href: urlForAgents,
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

export default RdvCard
