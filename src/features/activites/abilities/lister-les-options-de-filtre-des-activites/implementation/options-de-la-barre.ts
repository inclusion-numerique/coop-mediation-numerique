import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { MediateurId } from '../../../domain'
import {
  type OptionsDeFiltreDesActivites,
  optionsDeFiltreDesActivites,
} from './prisma/options-de-filtre-des-activites.query'

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

export type OptionsDeLaBarre = Omit<
  OptionsDeFiltreDesActivites,
  'periodeCouverte'
> & {
  readonly communes: SelectOption[]
  readonly departements: SelectOption[]
  readonly lieux: SelectOption[]
  readonly periodeCouverte: PeriodeCouverte
}

export const optionsDeLaBarre = async ({
  mediateurId,
  lieuxDesActivites,
  communesEtDepartements,
  periodeDesRendezVous,
}: {
  readonly mediateurId: MediateurId
  readonly lieuxDesActivites: () => Promise<SelectOption[]>
  readonly communesEtDepartements: () => Promise<{
    communesOptions: SelectOption[]
    departementsOptions: SelectOption[]
  }>
  readonly periodeDesRendezVous: () => Promise<PeriodeCouverte>
}): Promise<OptionsDeLaBarre> => {
  const [
    activites,
    lieux,
    { communesOptions, departementsOptions },
    rendezVous,
  ] = await Promise.all([
    optionsDeFiltreDesActivites({ mediateurId }),
    lieuxDesActivites(),
    communesEtDepartements(),
    periodeDesRendezVous(),
  ])
  return {
    communes: communesOptions,
    departements: departementsOptions,
    lieux,
    employeuses: activites.employeuses,
    tags: activites.tags,
    periodeCouverte: periodeLaPlusLarge(activites.periodeCouverte, rendezVous),
    importsV1: activites.importsV1,
    aDesActivites: activites.aDesActivites,
  }
}
