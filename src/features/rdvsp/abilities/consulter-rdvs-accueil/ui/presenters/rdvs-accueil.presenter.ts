import { dateAsDayFullWordsInTimezone } from '@/libraries/date/date-as-day'
import { dateAsTimeInTimeZone } from '@/libraries/date/date-as-day-and-time'
import { pluriel } from '@/libraries/pluriel'
import type { RdvEnUneLigne } from '../../domain/donnees-accueil-rdv'

const libelleParticipants = (rdv: RdvEnUneLigne): string => {
  if (rdv.collectif) {
    return `${rdv.nombreParticipants} ${pluriel(
      rdv.nombreParticipants,
      'participant',
      'participants',
    )}`
  }

  const participant = rdv.premierParticipant

  return participant === null
    ? 'anonyme'
    : [participant.prenom, participant.nom].filter(Boolean).join(' ') ||
        'anonyme'
}

const creneau = (rdv: RdvEnUneLigne, timezone: string): string =>
  `${dateAsDayFullWordsInTimezone(rdv.debut, timezone)} de ${dateAsTimeInTimeZone(
    rdv.debut,
    timezone,
  )} à ${dateAsTimeInTimeZone(rdv.fin, timezone)}`

export const phraseRdv = (
  prefixe: string,
  rdv: RdvEnUneLigne,
  timezone: string,
): string =>
  `${prefixe} le ${creneau(rdv, timezone)} avec ${libelleParticipants(rdv)}`
