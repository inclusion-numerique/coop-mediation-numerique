import type { Result } from '@/libraries/result'
import type { BilanModele } from '../../../domain/compte/bilan-synchronisation'
import type { CompteRdvUtilisable } from '../../../domain/compte/compte-rdv'
import type {
  EchecDeSynchronisation,
  ErreurTechnique,
} from '../../../domain/errors'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { OrganisationId } from '../../../domain/identifiants/organisation-id'
import type { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import type { RdvServicePublicApi } from '../../../domain/ports'
import type { Rapprochement } from '../../../domain/rapprochement'
import type { ResultatSynchronisation } from './resultat-synchronisation'

export type ReconcilierOrganisations = (reconciliation: {
  readonly compte: CompteRdvUtilisable
}) => Promise<
  Result<
    {
      readonly bilan: BilanModele
      readonly organisationIdsRecues: readonly OrganisationId[]
    },
    EchecDeSynchronisation
  >
>

export type ReconcilierRdvs = (reconciliation: {
  readonly compte: CompteRdvUtilisable
  readonly organisationIds?: readonly OrganisationId[]
  readonly mediateurId: MediateurId
  readonly tailleLot: number
  readonly maintenant: Date
}) => Promise<
  Result<
    {
      readonly rdvs: BilanModele
      readonly usagers: BilanModele
      readonly motifs: BilanModele
      readonly lieux: BilanModele
      readonly organisationIdsInaccessibles: readonly OrganisationId[]
      readonly rapprochements: readonly Rapprochement[]
    },
    EchecDeSynchronisation
  >
>

export type DestinationDesWebhooksJoignable = () => boolean

export type NoterLesWebhooksInvalides = (invalides: {
  readonly agentId: RdvAgentId
  readonly organisationIds: readonly OrganisationId[]
}) => Promise<Result<void, ErreurTechnique>>

export type DetacherOrganisations = (detachement: {
  readonly compte: CompteRdvUtilisable
  readonly organisationIds: readonly OrganisationId[]
}) => Promise<Result<void, ErreurTechnique>>

export type OuvrirJournal = (ouverture: {
  readonly compte: CompteRdvUtilisable
  readonly organisationIds?: readonly OrganisationId[]
}) => Promise<Result<{ readonly journalId: string }, ErreurTechnique>>

export type CloturerJournal = (cloture: {
  readonly journalId: string
  readonly resultat: ResultatSynchronisation
  readonly journal: string
}) => Promise<Result<void, ErreurTechnique>>

export type EchouerJournal = (echec: {
  readonly journalId: string
  readonly message: string
  readonly journal: string
}) => Promise<Result<void, ErreurTechnique>>

export type NoterLaSynchronisationReussie = (reussite: {
  readonly agentId: RdvAgentId
  readonly organisationIdsSansWebhook: readonly OrganisationId[] | undefined
}) => Promise<Result<void, ErreurTechnique>>

export type SynchroniserCompteRdvPorts = {
  readonly reconcilierOrganisations: ReconcilierOrganisations
  readonly reconcilierRdvs: ReconcilierRdvs
  readonly listerWebhooksDeLaCoop: RdvServicePublicApi['listerWebhooksDeLaCoop']
  readonly poserWebhook: RdvServicePublicApi['poserWebhook']
  readonly relireWebhooksDeLaCoop: RdvServicePublicApi['listerWebhooksDeLaCoop']
  readonly reconfigurerWebhook: RdvServicePublicApi['reconfigurerWebhook']
  readonly destinationDesWebhooksJoignable: DestinationDesWebhooksJoignable
  readonly noterLesWebhooksInvalides: NoterLesWebhooksInvalides
  readonly detacherOrganisations: DetacherOrganisations
  readonly ouvrirJournal: OuvrirJournal
  readonly cloturerJournal: CloturerJournal
  readonly echouerJournal: EchouerJournal
  readonly noterLaSynchronisationReussie: NoterLaSynchronisationReussie
}
