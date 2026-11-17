import { EmployeuseId, employeuseAffichage } from '@/features/employeuse'
import { consulterEmployeuse } from '@/features/employeuse/server'
import {
  getCommunesAndDepartementsOptions,
  getLieuxActiviteOptions,
} from '@/features/lieux-activite/abilities/lister-les-options-de-lieux'
import type { FiltresUtilisateurs } from '@/features/utilisateurs/domain'
import type { OptionsDesFiltres } from '@/features/utilisateurs/ui'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'

const employeusesChoisies = async (
  ids: FiltresUtilisateurs['employeuses'],
): Promise<readonly SelectOption[]> => {
  const consultees = await Promise.all(
    ids.map((id) => consulterEmployeuse({ employeuseId: EmployeuseId(id) })),
  )

  return consultees.flatMap((consultee) =>
    consultee === null
      ? []
      : [
          {
            value: String(consultee.employeuse.id),
            label: employeuseAffichage(consultee.employeuse).nom ?? '',
          },
        ],
  )
}

export const optionsDesFiltres = async (
  filtres: FiltresUtilisateurs,
): Promise<OptionsDesFiltres> => {
  const [{ communesOptions, departementsOptions }, lieux, employeuses] =
    await Promise.all([
      getCommunesAndDepartementsOptions(),
      getLieuxActiviteOptions(),
      employeusesChoisies(filtres.employeuses),
    ])

  return {
    employeuses,
    lieux,
    communes: communesOptions,
    departements: departementsOptions,
  }
}
