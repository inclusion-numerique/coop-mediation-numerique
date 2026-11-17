import { isAfter, isBefore } from 'date-fns'

export type PeriodeDeValidite = {
  readonly debut: Date
  readonly fin: Date | null
}

export const MESSAGE_FIN_AVANT_DEBUT =
  'La fin de validité ne peut pas précéder son début'

export const finApresDebut = ({ debut, fin }: PeriodeDeValidite): boolean =>
  fin == null || !isBefore(fin, debut)

export const estValideLe = (
  { debut, fin }: PeriodeDeValidite,
  maintenant: Date,
): boolean =>
  !isAfter(debut, maintenant) && (fin == null || !isBefore(fin, maintenant))
