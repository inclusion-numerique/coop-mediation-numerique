import { pluriel } from '@app/web/libraries/pluriel'
import { dateAsDayFullWordsInTimezone } from '@app/web/utils/dateAsDay'
import { dateAsTimeInTimeZone } from '@app/web/utils/dateAsDayAndTime'
import type { RdvEnUneLigne } from '../domain/donnees-accueil-rdv'

/**
 * Qui l'on voit à ce rendez-vous. Un atelier collectif annonce un nombre, un
 * rendez-vous individuel une personne — et « anonyme » quand La Coop n'a pas
 * l'identité du participant, ce qui arrive tant que la synchronisation ne l'a
 * pas rapportée.
 */
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
