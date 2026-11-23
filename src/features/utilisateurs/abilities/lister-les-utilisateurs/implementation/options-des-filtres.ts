import type { FiltresUtilisateurs } from '@/features/utilisateurs/domain'
import type { OptionsDesFiltres } from '@/features/utilisateurs/ui'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'

export type SourcesDesOptions = {
  readonly communesEtDepartements: () => Promise<{
    readonly communesOptions: readonly SelectOption[]
    readonly departementsOptions: readonly SelectOption[]
  }>
  readonly lieux: () => Promise<readonly SelectOption[]>
  readonly nomDeLEmployeuse: (id: number) => Promise<string | null>
}

const employeusesChoisies = async (
  ids: FiltresUtilisateurs['employeuses'],
  nomDeLEmployeuse: SourcesDesOptions['nomDeLEmployeuse'],
): Promise<readonly SelectOption[]> => {
  const noms = await Promise.all(
    ids.map(async (id) => ({ id, nom: await nomDeLEmployeuse(id) })),
  )

  return noms.flatMap(({ id, nom }) =>
    nom === null ? [] : [{ value: String(id), label: nom }],
  )
}

export const optionsDesFiltres = async (
  filtres: FiltresUtilisateurs,
  sources: SourcesDesOptions,
): Promise<OptionsDesFiltres> => {
  const [{ communesOptions, departementsOptions }, lieux, employeuses] =
    await Promise.all([
      sources.communesEtDepartements(),
      sources.lieux(),
      employeusesChoisies(filtres.employeuses, sources.nomDeLEmployeuse),
    ])

  return {
    employeuses,
    lieux,
    communes: communesOptions,
    departements: departementsOptions,
  }
}
