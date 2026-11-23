import type { FiltresUtilisateurs } from '@/features/utilisateurs/domain'
import { type OptionsDesFiltres } from '@/features/utilisateurs/ui/libelles-des-filtres.presenter'
import { departementsByCode } from '@/libraries/departement/departements'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { optionDuCoordinateur } from '../ui/coordinateur-a-choisir.presenter'
import { coordinateursChoisis } from './prisma'

export type SourcesDesOptions = {
  readonly communes: (
    codesInsee: readonly string[],
  ) => Promise<readonly SelectOption[]>
  readonly lieux: (ids: readonly string[]) => Promise<readonly SelectOption[]>
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
): Promise<OptionsDesFiltres> => {
  const [communes, lieux, employeuses, coordinateurs] = await Promise.all([
    sources.communes(filtres.communes),
    sources.lieux(filtres.lieux),
    employeusesChoisies(filtres.employeuses, sources.nomDeLEmployeuse),
    coordinateursChoisis(filtres.coordinateurs),
  ])

  return {
    employeuses,
    coordinateurs: coordinateurs.map(optionDuCoordinateur),
    lieux,
    communes,
    departements: departementsChoisis(filtres.departements),
  }
}
