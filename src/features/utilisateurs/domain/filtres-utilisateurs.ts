import { z } from 'zod'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'
import { CoordinateurId } from './coordinateur-id'
import { Dispositif } from './dispositif'
import { FiltreStatut } from './filtre-statut'

export const rolesFiltres = [
  'mediateur',
  'coordinateur',
  'administrateur',
] as const

export const RoleFiltre = defineModel(z.enum(rolesFiltres).brand('RoleFiltre'))
export type RoleFiltre = Model.TypeOf<typeof RoleFiltre>

const LieuActiviteId = defineModel(z.guid().brand('LieuActiviteId'))
type LieuActiviteId = Model.TypeOf<typeof LieuActiviteId>

const EmployeuseId = defineModel(
  z.coerce.number().int().positive().brand('EmployeuseId'),
)
type EmployeuseId = Model.TypeOf<typeof EmployeuseId>

const EtendueDesRattachements = defineModel(
  z.enum(['Actuels', 'ActuelsEtAnciens']).brand('EtendueDesRattachements'),
)
type EtendueDesRattachements = Model.TypeOf<typeof EtendueDesRattachements>

export type FiltresUtilisateurs = {
  readonly roles: readonly RoleFiltre[]
  readonly statut: FiltreStatut | null
  readonly dispositif: Dispositif | null
  readonly employeuses: readonly EmployeuseId[]
  readonly coordinateurs: readonly CoordinateurId[]
  readonly rattachements: EtendueDesRattachements
  readonly lieux: readonly LieuActiviteId[]
  readonly communes: readonly CodeInsee[]
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
  coordinateurs: [],
  rattachements: EtendueDesRattachements('Actuels'),
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
  coordinateurs: validesParmi(CoordinateurId)(parametres.coordinateurs),
  rattachements: EtendueDesRattachements(
    valeursDe(parametres.historique)[0] === '1'
      ? 'ActuelsEtAnciens'
      : 'Actuels',
  ),
  lieux: validesParmi(LieuActiviteId)(parametres.lieux),
  communes: validesParmi(CodeInsee)(parametres.communes),
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
      ['coordinateurs', filtres.coordinateurs.join(',')],
      ['lieux', filtres.lieux.join(',')],
      ['communes', filtres.communes.join(',')],
      ['departements', filtres.departements.join(',')],
      ['historique', filtres.rattachements === 'ActuelsEtAnciens' ? '1' : ''],
    ].filter(([, valeur]) => valeur !== ''),
  )
