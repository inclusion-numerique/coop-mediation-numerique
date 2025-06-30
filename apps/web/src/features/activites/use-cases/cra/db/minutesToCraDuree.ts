import { dureeAccompagnementPersonnaliseeValue } from '../fields/duree-accompagnement'
import { CraDureeData } from '../validation/CraDureeValidation'

export const craDureeDataToMinutes = ({
  duree,
  dureePersonnaliseeHeures,
  dureePersonnaliseeMinutes,
}: CraDureeData): number => {
  if (duree !== 'personnaliser') {
    return Number.parseInt(duree, 10)
  }

  const hours =
    typeof dureePersonnaliseeHeures === 'number' &&
    !Number.isNaN(dureePersonnaliseeHeures)
      ? dureePersonnaliseeHeures
      : 0

  const minutes =
    typeof dureePersonnaliseeMinutes === 'number' &&
    !Number.isNaN(dureePersonnaliseeMinutes)
      ? dureePersonnaliseeMinutes
      : 0

  return hours * 60 + minutes
}

export const minutesToCraDureeData = (
  minutes: number | undefined | null,
): CraDureeData | null => {
  if (minutes === undefined || minutes === null) {
    return null
  }

  const absoluteMinutes = Math.abs(minutes)

  const minutesString = absoluteMinutes.toString()

  if (minutesString === '0') {
    return {
      duree: dureeAccompagnementPersonnaliseeValue,
      dureePersonnaliseeHeures: undefined,
      dureePersonnaliseeMinutes: undefined,
    }
  }

  return {
    duree: minutesString,
    dureePersonnaliseeHeures: undefined,
    dureePersonnaliseeMinutes: undefined,
  }
}

export const minutesToCustomCraDureeData = (minutes: number): CraDureeData => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return {
    duree: dureeAccompagnementPersonnaliseeValue,
    dureePersonnaliseeHeures: hours,
    dureePersonnaliseeMinutes: remainingMinutes,
  }
}
