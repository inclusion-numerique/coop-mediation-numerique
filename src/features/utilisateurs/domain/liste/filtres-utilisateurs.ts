import { z } from 'zod'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'
import { Dispositif } from '../dispositif'
import { CoordinateurId } from '../identifiants/coordinateur-id'
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

export const EtendueDesRattachements = defineModel(
  z.enum(['Actuels', 'ActuelsEtAnciens']).brand('EtendueDesRattachements'),
)
export type EtendueDesRattachements = Model.TypeOf<
  typeof EtendueDesRattachements
>

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
