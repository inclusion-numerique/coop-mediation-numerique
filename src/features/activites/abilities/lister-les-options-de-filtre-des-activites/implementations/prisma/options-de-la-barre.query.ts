import type { MediateurId } from '../../../../domain'
import {
  type OptionsDeFiltreDesActivites,
  optionsDeFiltreDesActivites,
} from './options-de-filtre-des-activites.query'

type PeriodeCouverte = OptionsDeFiltreDesActivites['periodeCouverte']

const plusTot = (a: Date | undefined, b: Date | undefined) =>
  a === undefined || (b !== undefined && b < a) ? b : a

const plusTard = (a: Date | undefined, b: Date | undefined) =>
  a === undefined || (b !== undefined && b > a) ? b : a

export const periodeLaPlusLarge = (
  activites: PeriodeCouverte,
  rendezVous: PeriodeCouverte,
): PeriodeCouverte => ({
  first: plusTot(activites.first, rendezVous.first),
  last: plusTard(activites.last, rendezVous.last),
})

export const optionsDesFiltres = async ({
  mediateurId,
  periodeDesRendezVous,
}: {
  readonly mediateurId: MediateurId
  readonly periodeDesRendezVous: () => Promise<PeriodeCouverte>
}) => {
  const [activites, rendezVous] = await Promise.all([
    optionsDeFiltreDesActivites({ mediateurId }),
    periodeDesRendezVous(),
  ])
  return {
    ...activites,
    periodeCouverte: periodeLaPlusLarge(activites.periodeCouverte, rendezVous),
  }
}
