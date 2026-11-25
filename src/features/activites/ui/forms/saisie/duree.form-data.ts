import { CraDureeData } from '@/features/activites/ui/forms/duree-du-cra.validation'
import { dureeAccompagnementPersonnaliseeValue } from '@/features/activites/ui/labels/libelles/duree-accompagnement.labels'

export const minutesDeLaDuree = ({
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

export const dureeDepuisLesMinutes = (
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

export const dureePersonnaliseeDepuisLesMinutes = (
  minutes: number,
): CraDureeData => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return {
    duree: dureeAccompagnementPersonnaliseeValue,
    dureePersonnaliseeHeures: hours,
    dureePersonnaliseeMinutes: remainingMinutes,
  }
}
