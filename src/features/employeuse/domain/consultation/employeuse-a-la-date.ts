import type { Contrat } from '../affectation/contrat'
import { couvre, debutEmploi } from '../affectation/periode-emploi'
import type { Employeuse } from '../employeuse'

const contratCouvrant = (
  contrats: readonly Contrat[],
  date: Date,
): Contrat | null =>
  contrats
    .flatMap((contrat) => {
      const debut = debutEmploi(contrat.periode)
      return debut !== null && couvre(contrat.periode, date)
        ? [{ contrat, debut }]
        : []
    })
    .toSorted((a, b) => b.debut.getTime() - a.debut.getTime())
    .at(0)?.contrat ?? null

export const employeuseALaDate = (
  actuelle: Employeuse | null,
  contrats: readonly Contrat[],
  date: Date,
): Employeuse | null => contratCouvrant(contrats, date)?.employeuse ?? actuelle
