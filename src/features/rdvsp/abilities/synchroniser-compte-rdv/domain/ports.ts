import type { EchecTechnique, Result } from '@/libraries/result'
import type { BilanModele } from '../../../domain/compte/bilan-synchronisation'
import type { CompteRdvUtilisable } from '../../../domain/compte/compte-rdv'
import type { EchecDeSynchronisation } from '../../../domain/errors'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { OrganisationId } from '../../../domain/identifiants/organisation-id'
import type { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import type { PorteeDeSynchronisation } from '../../../domain/portee-de-synchronisation'
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
  readonly portee: PorteeDeSynchronisation
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
}) => Promise<Result<void, EchecTechnique>>

export type DetacherOrganisations = (detachement: {
  readonly compte: CompteRdvUtilisable
  readonly organisationIds: readonly OrganisationId[]
}) => Promise<Result<void, EchecTechnique>>

export type OuvrirJournal = (ouverture: {
  readonly compte: CompteRdvUtilisable
  readonly portee: PorteeDeSynchronisation
  readonly ouvertLe: Date
}) => Promise<Result<{ readonly journalId: string }, EchecTechnique>>

export type CloturerJournal = (cloture: {
  readonly journalId: string
  readonly resultat: ResultatSynchronisation
  readonly journal: string
}) => Promise<Result<void, EchecTechnique>>

export type EchouerJournal = (echec: {
  readonly journalId: string
  readonly message: string
  readonly journal: string
}) => Promise<Result<void, EchecTechnique>>

export type NoterLaSynchronisationReussie = (reussite: {
  readonly agentId: RdvAgentId
  readonly synchroniseeLe: Date
}) => Promise<Result<void, EchecTechnique>>

export type PoserUnWebhookPorts = {
  readonly listerWebhooksDeLaCoop: RdvServicePublicApi['listerWebhooksDeLaCoop']
  readonly poserWebhook: RdvServicePublicApi['poserWebhook']
  readonly relireWebhooksDeLaCoop: RdvServicePublicApi['listerWebhooksDeLaCoop']
  readonly reconfigurerWebhook: RdvServicePublicApi['reconfigurerWebhook']
  readonly destinationDesWebhooksJoignable: DestinationDesWebhooksJoignable
}

export type PoserLesWebhooksPorts = PoserUnWebhookPorts & {
  readonly noterLesWebhooksInvalides: NoterLesWebhooksInvalides
}

export type SynchroniserCompteRdvPorts = PoserLesWebhooksPorts & {
  readonly reconcilierOrganisations: ReconcilierOrganisations
  readonly reconcilierRdvs: ReconcilierRdvs
  readonly detacherOrganisations: DetacherOrganisations
  readonly ouvrirJournal: OuvrirJournal
  readonly cloturerJournal: CloturerJournal
  readonly echouerJournal: EchouerJournal
  readonly noterLaSynchronisationReussie: NoterLaSynchronisationReussie
}
