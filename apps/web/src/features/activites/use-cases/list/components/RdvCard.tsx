import type { Rdv } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getRdvs'
import { BeneficiaireCraData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import type { OAuthApiRdvStatus } from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import {
  dateAsDayInTimeZone,
  dateAsTime,
  dateAsTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { UserRdvAccount, UserTimezone } from '@app/web/utils/user'
import type { AlertProps } from '@codegouvfr/react-dsfr/Alert'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { DefaultValues } from 'react-hook-form'
import { CraIndividuelData } from '../../cra/individuel/validation/CraIndividuelValidation'
import ActiviteCardSpacer from './ActiviteCardSpacer'
import ActiviteOrRdvListCard from './ActiviteOrRdvListCard'
import RdvStatusBadge from './RdvStatusBadge'

const createCraUrlFromRdv = ({
  id,
  date,
  durationInMinutes,
  participations,
}: Rdv) => {
  const participationBeneficiaireSuivi = participations.find(
    (participation) => !!participation.user.beneficiaire,
  )?.user.beneficiaire

  const beneficiaire = participationBeneficiaireSuivi
    ? ({
        id: participationBeneficiaireSuivi.id,
        prenom: participationBeneficiaireSuivi.prenom,
        nom: participationBeneficiaireSuivi.nom,
        mediateurId: participationBeneficiaireSuivi.mediateurId,
      } satisfies BeneficiaireCraData)
    : undefined

  const defaultValues: DefaultValues<CraIndividuelData> = {
    date: dateAsIsoDay(date),
    duree: {
      dureePersonnaliseeMinutes: durationInMinutes,
      duree: 'personnaliser',
    },
    beneficiaire,
    rdvServicePublicId: id,
  }

  return `/coop/mes-activites/cra/individuel?v=${encodeSerializableState(defaultValues)}`
}

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

  const startTime = dateAsTimeInTimeZone(date, timezone)
  const endTime = dateAsTimeInTimeZone(
    new Date(date.getTime() + durationInMinutes * 1000 * 60),
    timezone,
  )
  const canCompleteCra = status === 'seen' && date.getTime() < now

  const newCraLink = canCompleteCra ? createCraUrlFromRdv(activite) : ''

  return (
    <ActiviteOrRdvListCard
      illustrationSrc="/images/services/rdv-service-public.svg"
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
              Voir
            </Button>
          )}
        </>
      }
    />
  )
}

export default RdvCard
