import type { Result } from '@/libraries/result'
import type { PayloadInexploitable } from '../../../domain/errors'
import type { UsagerId } from '../../../domain/identifiants/usager-id'
import type { Usager } from '../../../domain/usager'
import type { BeneficiaireLie } from './decision-webhook-usager'
import type { AnonymisationDeLUsager } from './webhook-usager-traite'

export type LireNotificationUsager = (
  payload: unknown,
) => Result<Usager, PayloadInexploitable>

export type BeneficiairesLiesAUsager = (
  usagerId: UsagerId,
) => Promise<readonly BeneficiaireLie[]>

export type MettreAJourUsager = (usager: Usager) => Promise<void>

export type AnonymiserEtSupprimerUsager = (
  anonymisation: AnonymisationDeLUsager,
) => Promise<void>

export type RecevoirWebhookUsagerPorts = {
  readonly lireNotification: LireNotificationUsager
  readonly beneficiairesLies: BeneficiairesLiesAUsager
  readonly mettreAJour: MettreAJourUsager
  readonly anonymiserEtSupprimer: AnonymiserEtSupprimerUsager
}
