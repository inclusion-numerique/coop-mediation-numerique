import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { Dispositif } from './dispositif'
import { FiltreStatut } from './filtre-statut'

export const rolesFiltres = [
  'mediateur',
  'coordinateur',
  'administrateur',
] as const

export const RoleFiltre = defineModel(z.enum(rolesFiltres).brand('RoleFiltre'))
export type RoleFiltre = Model.TypeOf<typeof RoleFiltre>

export const LieuActiviteId = defineModel(z.guid().brand('LieuActiviteId'))
export type LieuActiviteId = Model.TypeOf<typeof LieuActiviteId>

export const EmployeuseId = defineModel(
  z.coerce.number().int().positive().brand('EmployeuseId'),
)
export type EmployeuseId = Model.TypeOf<typeof EmployeuseId>

export const CodeCommune = defineModel(
  z
    .string()
    .regex(/^[0-9][0-9AB][0-9]{3}$/)
    .brand('CodeCommune'),
)
export type CodeCommune = Model.TypeOf<typeof CodeCommune>

export const CodeDepartement = defineModel(
  z
    .string()
    .regex(/^[0-9][0-9AB][0-9]?$/)
    .brand('CodeDepartement'),
)
export type CodeDepartement = Model.TypeOf<typeof CodeDepartement>

export type FiltresUtilisateurs = {
  readonly roles: readonly RoleFiltre[]
  readonly statut: FiltreStatut | null
  readonly dispositif: Dispositif | null
  readonly employeuses: readonly EmployeuseId[]
  readonly lieux: readonly LieuActiviteId[]
  readonly communes: readonly CodeCommune[]
  readonly departements: readonly CodeDepartement[]
}

export type ParametresDeFiltres = Readonly<
  Record<string, string | readonly string[] | undefined>
>

const valeursDe = (brut: string | readonly string[] | undefined) =>
  (typeof brut === 'string' ? brut.split(',') : (brut ?? []))
    .map((valeur) => valeur.trim())
    .filter((valeur) => valeur !== '')

const validesParmi =
  <S extends z.ZodType>(modele: { readonly schema: S }) =>
  (brut: string | readonly string[] | undefined): readonly z.output<S>[] =>
    valeursDe(brut).flatMap((valeur) => {
      const resultat = modele.schema.safeParse(valeur)
      return resultat.success ? [resultat.data] : []
    })

const premierValideParmi =
  <S extends z.ZodType>(modele: { readonly schema: S }) =>
  (brut: string | readonly string[] | undefined): z.output<S> | null =>
    validesParmi(modele)(brut).at(0) ?? null

const dispositifDuParametre: Readonly<Record<string, Dispositif>> = {
  '1': Dispositif('ConseillerNumerique'),
  '0': Dispositif('HorsDispositif'),
}

export const AUCUN_FILTRE: FiltresUtilisateurs = {
  roles: [],
  statut: null,
  dispositif: null,
  employeuses: [],
  lieux: [],
  communes: [],
  departements: [],
}

export const filtresUtilisateurs = (
  parametres: ParametresDeFiltres,
): FiltresUtilisateurs => ({
  roles: validesParmi(RoleFiltre)(parametres.roles),
  statut: premierValideParmi(FiltreStatut)(parametres.statut),
  dispositif:
    dispositifDuParametre[
      valeursDe(parametres.conseiller_numerique)[0] ?? ''
    ] ?? null,
  employeuses: validesParmi(EmployeuseId)(parametres.employeuses),
  lieux: validesParmi(LieuActiviteId)(parametres.lieux),
  communes: validesParmi(CodeCommune)(parametres.communes),
  departements: validesParmi(CodeDepartement)(parametres.departements),
})

const parametreDuDispositif = (dispositif: Dispositif): string =>
  dispositif === 'ConseillerNumerique' ? '1' : '0'

export const parametresDesFiltres = (
  filtres: FiltresUtilisateurs,
): Readonly<Record<string, string>> =>
  Object.fromEntries(
    [
      ['roles', filtres.roles.join(',')],
      ['statut', filtres.statut ?? ''],
      [
        'conseiller_numerique',
        filtres.dispositif === null
          ? ''
          : parametreDuDispositif(filtres.dispositif),
      ],
      ['employeuses', filtres.employeuses.join(',')],
      ['lieux', filtres.lieux.join(',')],
      ['communes', filtres.communes.join(',')],
      ['departements', filtres.departements.join(',')],
    ].filter(([, valeur]) => valeur !== ''),
  )
