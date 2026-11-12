import { dateAsTimeInTimeZone } from '@app/web/utils/dateAsDayAndTime'
import { numberToString } from '@app/web/utils/formatNumber'
import type { RendezVousDeLaChronologie } from '../../domain'
import {
  apparenceDuStatut,
  type SeveriteDeBadge,
} from '../libelles/statut-de-rendez-vous'

export type CarteDeRendezVous = {
  readonly id: number
  readonly collectif: boolean
  readonly horaires: string
  readonly description: string
  readonly statut: {
    readonly libelle: string
    readonly severite: SeveriteDeBadge
  }
  readonly aRenseigner: boolean
  readonly lien: string
}

const descriptionDe = ({
  motif,
  titre,
  places,
  participants,
}: RendezVousDeLaChronologie): string => {
  const collectif = motif?.collectif ?? false
  return [
    motif?.nom ?? '',
    collectif && titre !== null ? titre : '',
    collectif
      ? places === null
        ? ''
        : `(${numberToString(places)} places)`
      : `avec ${participants.join(', ')}`,
  ]
    .filter(Boolean)
    .join(' ')
}

export const carteDeRendezVous = (
  rendezVous: RendezVousDeLaChronologie,
  fuseau: string,
): CarteDeRendezVous => ({
  id: rendezVous.id,
  collectif: rendezVous.motif?.collectif ?? false,
  horaires: `${dateAsTimeInTimeZone(rendezVous.debut, fuseau)} à ${dateAsTimeInTimeZone(rendezVous.fin, fuseau)}`,
  description: descriptionDe(rendezVous),
  statut: apparenceDuStatut(rendezVous.statut),
  aRenseigner: rendezVous.statut === 'Passe' || rendezVous.statut === 'Honore',
  lien: rendezVous.lienAgent,
})
