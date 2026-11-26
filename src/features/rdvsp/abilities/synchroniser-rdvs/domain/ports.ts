import type { Result } from '@/libraries/result'
import type { CompteRdvUtilisable } from '../../../domain/compte/compte-rdv'
import type { ErreurTechnique } from '../../../domain/errors'
import type { OrganisationId } from '../../../domain/identifiants/organisation-id'
import type { RdvId } from '../../../domain/identifiants/rdv-id'
import type {
  LireLesUsagersARapprocher,
  RapprocherLesBeneficiaires,
  RdvServicePublicApi,
} from '../../../domain/ports'
import type { EtatConnu, PlanLot } from './plan-rdvs'

export type RdvsDejaImportes = (portee: {
  readonly compte: CompteRdvUtilisable
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<Result<readonly RdvId[], ErreurTechnique>>

export type EtatConnuDuLot = (lecture: {
  readonly rdvIds: readonly RdvId[]
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<Result<EtatConnu, ErreurTechnique>>

export type AppliquerPlanLot = (application: {
  readonly compte: CompteRdvUtilisable
  readonly plan: PlanLot
  readonly bruts: ReadonlyMap<RdvId, unknown>
}) => Promise<Result<void, ErreurTechnique>>

export type SupprimerMotifsOrphelins = (
  organisationIds: readonly OrganisationId[],
) => Promise<Result<number, ErreurTechnique>>

export type SupprimerRdvs = (
  rdvIds: readonly RdvId[],
) => Promise<Result<void, ErreurTechnique>>

export type SynchroniserRdvsPorts = {
  readonly listerRdvs: RdvServicePublicApi['listerRdvs']
  readonly rdvsDejaImportes: RdvsDejaImportes
  readonly etatConnuDuLot: EtatConnuDuLot
  readonly appliquerPlan: AppliquerPlanLot
  readonly supprimerRdvs: SupprimerRdvs
  readonly supprimerMotifsOrphelins: SupprimerMotifsOrphelins
  readonly lireLesUsagersARapprocher: LireLesUsagersARapprocher
  readonly rapprocherLesBeneficiaires: RapprocherLesBeneficiaires
}
