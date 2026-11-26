import type { Result } from '@/libraries/result'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { OrganisationId } from '../../../domain/identifiants/organisation-id'
import type { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import type { RdvId } from '../../../domain/identifiants/rdv-id'
import type {
  LireLesUsagersARapprocher,
  RapprocherLesBeneficiaires,
} from '../../../domain/ports'
import type { Rdv } from '../../../domain/rdv/rdv'
import type { RdvConnu } from './decision-webhook'
import type { EchecDeRecevoirWebhookRdv } from './errors'

export type LireNotificationRdv = (
  payload: unknown,
) => Result<
  { readonly agentId: RdvAgentId; readonly rdv: Rdv },
  EchecDeRecevoirWebhookRdv
>

export type OrganisationConnue = (
  organisationId: OrganisationId,
) => Promise<boolean>

export type ComptePourWebhook = (agentId: RdvAgentId) => Promise<{
  readonly synchroniserDepuis: Date | null
  readonly mediateurId: MediateurId | null
} | null>

export type RdvConnuParId = (rdvId: RdvId) => Promise<RdvConnu | null>

export type EnregistrerRdvDeLaNotification = (enregistrement: {
  readonly rdv: Rdv
  readonly brut: unknown
}) => Promise<void>

export type SupprimerRdvDeLaNotification = (rdvId: RdvId) => Promise<void>

export type RecevoirWebhookRdvPorts = {
  readonly lireNotification: LireNotificationRdv
  readonly comptePourWebhook: ComptePourWebhook
  readonly rdvConnuParId: RdvConnuParId
  readonly organisationConnue: OrganisationConnue
  readonly enregistrer: EnregistrerRdvDeLaNotification
  readonly supprimer: SupprimerRdvDeLaNotification
  readonly lireLesUsagersARapprocher: LireLesUsagersARapprocher
  readonly rapprocherLesBeneficiaires: RapprocherLesBeneficiaires
}
