import type { FiltresUtilisateurs } from '@/features/utilisateurs/domain'
import { departementsByCode } from '@/libraries/departement'
import type { SelectOption } from '@/libraries/ui'
import type { CoordinateurAChoisir } from '../../domain'

export type SourcesDesOptions = {
  readonly communes: (
    codesInsee: readonly string[],
  ) => Promise<readonly SelectOption[]>
  readonly lieux: (ids: readonly string[]) => Promise<readonly SelectOption[]>
  readonly nomDeLEmployeuse: (id: number) => Promise<string | null>
  readonly coordinateurs: (
    ids: FiltresUtilisateurs['coordinateurs'],
  ) => Promise<readonly CoordinateurAChoisir[]>
  readonly optionDuCoordinateur: (
    coordinateur: CoordinateurAChoisir,
  ) => SelectOption
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

const departementsChoisis = (
  codes: FiltresUtilisateurs['departements'],
): readonly SelectOption[] =>
  codes.flatMap((code) => {
    const departement = departementsByCode.get(code)
    return departement === undefined
      ? []
      : [{ value: code, label: `${code} · ${departement.nom}` }]
  })

export const optionsDesFiltres = async (
  filtres: FiltresUtilisateurs,
  sources: SourcesDesOptions,
): Promise<{
  readonly employeuses: readonly SelectOption[]
  readonly coordinateurs: readonly SelectOption[]
  readonly lieux: readonly SelectOption[]
  readonly communes: readonly SelectOption[]
  readonly departements: readonly SelectOption[]
}> => {
  const [communes, lieux, employeuses, coordinateurs] = await Promise.all([
    sources.communes(filtres.communes),
    sources.lieux(filtres.lieux),
    employeusesChoisies(filtres.employeuses, sources.nomDeLEmployeuse),
    sources.coordinateurs(filtres.coordinateurs),
  ])

  return {
    employeuses,
    coordinateurs: coordinateurs.map(sources.optionDuCoordinateur),
    lieux,
    communes,
    departements: departementsChoisis(filtres.departements),
  }
}
