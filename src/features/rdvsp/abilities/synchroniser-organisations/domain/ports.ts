import type { Result } from '@/libraries/result'
import type { CompteRdvUtilisable } from '../../../domain/compte/compte-rdv'
import type { ErreurTechnique } from '../../../domain/errors'
import type { OrganisationId } from '../../../domain/identifiants/organisation-id'
import type { Organisation } from '../../../domain/organisation'
import type { RdvServicePublicApi } from '../../../domain/ports'
import type { PlanSynchronisation } from './plan-synchronisation'

export type EtatOrganisations = (lecture: {
  readonly compte: CompteRdvUtilisable
  readonly idsRecus: readonly OrganisationId[]
}) => Promise<
  Result<
    {
      readonly connues: readonly Organisation[]
      readonly rattachements: readonly OrganisationId[]
    },
    ErreurTechnique
  >
>

export type AppliquerPlanOrganisations = (application: {
  readonly compte: CompteRdvUtilisable
  readonly plan: PlanSynchronisation
}) => Promise<Result<void, ErreurTechnique>>

export type SynchroniserOrganisationsPorts = {
  readonly listerOrganisations: RdvServicePublicApi['listerOrganisations']
  readonly etatOrganisations: EtatOrganisations
  readonly appliquerPlan: AppliquerPlanOrganisations
}
