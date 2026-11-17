import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { EmployeuseId, employeuseAffichage } from '@app/web/features/employeuse'
import { consulterEmployeuse } from '@app/web/features/employeuse/server'
import {
  getCommunesAndDepartementsOptions,
  getLieuxActiviteOptions,
} from '@app/web/features/lieux-activite/abilities/lister-les-options-de-lieux'
import type { FiltresUtilisateurs } from '@app/web/features/utilisateurs/domain'
import type { OptionsDesFiltres } from '@app/web/features/utilisateurs/ui'

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
