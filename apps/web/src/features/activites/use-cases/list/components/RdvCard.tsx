import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import {
  dateAsDayInTimeZone,
  dateAsTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { numberToString } from '@app/web/utils/formatNumber'
import { UserRdvAccount, UserTimezone } from '@app/web/utils/user'
import Button from '@codegouvfr/react-dsfr/Button'
import { SearchRdvResultItem } from '../db/searchActiviteAndRdvs'
import ActiviteCardSpacer from './ActiviteCardSpacer'
import ActiviteOrRdvListCard from './ActiviteOrRdvListCard'
import RdvStatusBadge from './RdvStatusBadge'

const RdvCard = ({
  rdv,
  user,
  displayBeneficiaire,
  displayDate,
}: {
  rdv: SearchRdvResultItem
  user: UserRdvAccount & UserTimezone
  displayBeneficiaire?: boolean
  displayDate?: boolean
}) => {
  const { timezone } = user

  const now = Date.now()
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
  const canCompleteCra = status === 'seen' && startsAt.getTime() < now

  const newCraLink = canCompleteCra
    ? `/coop/mes-activites/convertir-rdv-en-cra?rdv=${encodeSerializableState(rdv)}`
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
            <Button
              priority="tertiary no outline"
              size="small"
              className="fr-flex-shrink-0"
              linkProps={{
                href: newCraLink,
              }}
              title="Compléter un CRA à partir de ce RDV"
            >
              {/* Layout is broken with fr-enlarge-link if icon is in button props, we put it in the title instead */}
              <span className="fr-icon-edit-line fr-icon--sm fr-mr-1-5v" />{' '}
              Compléter&nbsp;un&nbsp;CRA
            </Button>
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
