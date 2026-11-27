import type { EchecTechnique, Result } from '@/libraries/result'
import type { Agent } from './agent'
import type { CompteRdvUtilisable } from './compte/compte-rdv'
import type { JetonsOAuth } from './compte/jetons-oauth'
import type { ErreurRdvApi } from './errors'
import type { MediateurId } from './identifiants/mediateur-id'
import type { OrganisationId } from './identifiants/organisation-id'
import type { RdvAgentId } from './identifiants/rdv-agent-id'
import type { RdvId } from './identifiants/rdv-id'
import type { UsagerId } from './identifiants/usager-id'
import type {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from './identite'
import type { Organisation } from './organisation'
import type { DemandeRdv, DemandeRdvCreee } from './rdv/demande-rdv'
import type { RdvSynchronise } from './rdv/rdv'
import type {
  StatutPresence,
  StatutPresenceModifiable,
} from './rdv/statut-presence'
import type { Usager } from './usager'
import type {
  AbonnementWebhook,
  WebhookId,
  WebhookInstalle,
} from './webhook/webhook'

export type FiltresRdvs = {
  readonly agentId?: RdvAgentId
  readonly organisationIds?: readonly OrganisationId[]
  readonly usagerId?: UsagerId
  readonly debutApres?: Date
  readonly debutAvant?: Date
  readonly premierePageSeulement?: boolean
}

export type FiltresUsagers = {
  readonly ids?: readonly UsagerId[]
  readonly premierePageSeulement?: boolean
}

export type RdvServicePublicApi = {
  readonly identifierAgent: (
    jetons: JetonsOAuth,
  ) => Promise<Result<Agent, ErreurRdvApi>>

  readonly listerOrganisations: (
    compte: CompteRdvUtilisable,
  ) => Promise<Result<readonly Organisation[], ErreurRdvApi>>

  readonly listerRdvs: (
    compte: CompteRdvUtilisable,
    filtres?: FiltresRdvs,
  ) => Promise<Result<readonly RdvSynchronise[], ErreurRdvApi>>

  readonly listerUsagers: (
    compte: CompteRdvUtilisable,
    filtres?: FiltresUsagers,
  ) => Promise<Result<readonly Usager[], ErreurRdvApi>>

  readonly recupererUsager: (
    compte: CompteRdvUtilisable,
    id: UsagerId,
  ) => Promise<Result<Usager | null, ErreurRdvApi>>

  readonly creerDemandeRdv: (
    compte: CompteRdvUtilisable,
    demande: DemandeRdv,
  ) => Promise<Result<DemandeRdvCreee, ErreurRdvApi>>

  readonly changerStatutRdv: (
    compte: CompteRdvUtilisable,
    id: RdvId,
    statut: StatutPresenceModifiable,
  ) => Promise<Result<StatutPresence, ErreurRdvApi>>

  readonly listerWebhooksDeLaCoop: (
    compte: CompteRdvUtilisable,
    organisationId: OrganisationId,
  ) => Promise<Result<readonly WebhookInstalle[], ErreurRdvApi>>

  readonly poserWebhook: (
    compte: CompteRdvUtilisable,
    organisationId: OrganisationId,
    abonnements: readonly AbonnementWebhook[],
  ) => Promise<Result<WebhookInstalle, ErreurRdvApi>>

  readonly reconfigurerWebhook: (
    compte: CompteRdvUtilisable,
    organisationId: OrganisationId,
    webhookId: WebhookId,
    abonnements: readonly AbonnementWebhook[],
  ) => Promise<Result<WebhookInstalle, ErreurRdvApi>>

  readonly renouvelerJetons: (
    compte: CompteRdvUtilisable,
  ) => Promise<Result<JetonsOAuth, ErreurRdvApi>>
}

export type UsagerExterne = {
  readonly rdvUserId: UsagerId
  readonly nom: NomExterne | null
  readonly prenom: PrenomExterne | null
  readonly telephone: TelephoneExterne | null
  readonly email: EmailExterne | null
  readonly adresse: string | null
  readonly birthDate: Date | null
}

export type DemandeDeRapprochement = {
  readonly usagers: readonly UsagerExterne[]
  readonly mediateurId: MediateurId
  readonly maintenant: Date
}

export type LireLesUsagersARapprocher = (
  usagerIds: readonly UsagerId[],
) => Promise<Result<readonly UsagerExterne[], EchecTechnique>>

export type RapprocherLesBeneficiaires = (
  demande: DemandeDeRapprochement,
) => Promise<Result<{ readonly skipped: readonly unknown[] }, never>>

export type RapprochementPorts = {
  readonly lireLesUsagersARapprocher: LireLesUsagersARapprocher
  readonly rapprocherLesBeneficiaires: RapprocherLesBeneficiaires
}

export type RevoquerJetons = (
  jetons: JetonsOAuth,
) => Promise<Result<void, ErreurRdvApi>>
