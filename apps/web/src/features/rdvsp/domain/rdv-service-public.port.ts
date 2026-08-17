import type { Result } from '@app/web/libraries/result'
import type { Agent } from './agent'
import type { CompteRdvUtilisable } from './compte-rdv'
import type { DemandeRdv, DemandeRdvCreee } from './demande-rdv'
import type { ErreurRdvApi } from './errors'
import type { JetonsOAuth } from './jetons-oauth'
import type { Organisation } from './organisation'
import type { OrganisationId } from './organisation-id'
import type { RdvSynchronise } from './rdv'
import type { RdvAgentId } from './rdv-agent-id'
import type { RdvId } from './rdv-id'
import type {
  StatutPresence,
  StatutPresenceModifiable,
} from './statut-presence'
import type { Usager } from './usager'
import type { UsagerId } from './usager-id'
import type { AbonnementWebhook, WebhookId, WebhookInstalle } from './webhook'

export type FiltresRdvs = {
  /** Restreint aux rendez-vous de cet agent, comme le fait la synchronisation. */
  readonly agentId?: RdvAgentId
  readonly organisationIds?: readonly OrganisationId[]
  readonly usagerId?: UsagerId
  readonly debutApres?: Date
  readonly debutAvant?: Date
  /** Se limiter à la première page, quand seul un aperçu est attendu. */
  readonly premierePageSeulement?: boolean
}

export type FiltresUsagers = {
  readonly ids?: readonly UsagerId[]
  readonly premierePageSeulement?: boolean
}

/**
 * Frontière unique entre La Coop et RDV Service Public.
 *
 * Tout ce que le port expose est exprimé dans le vocabulaire du domaine : ni
 * `snake_case`, ni pagination, ni jetons, ni codes HTTP ne le traversent. C'est
 * la raison d'être de cette couche — l'évolution d'API annoncée par RDV SP doit
 * pouvoir se jouer entièrement dans l'adaptateur, et un éventuel mode
 * serveur-à-serveur devenir une seconde implémentation du même contrat, sans que
 * les abilities appelantes en sachent quoi que ce soit.
 *
 * La pose des webhooks y figure, bien qu'elle relève de l'installation
 * d'infrastructure plus que du métier : c'est le prix pour que le port reste le
 * seul endroit qui parle HTTP à RDV Service Public. L'URL de destination et le
 * secret n'apparaissent donc pas dans le contrat — ils identifient La Coop comme
 * cible, et l'adaptateur les tient de sa configuration.
 */
export type RdvServicePublicApi = {
  /**
   * Identifie l'agent propriétaire des jetons. Seule méthode à ne pas prendre de
   * compte : c'est l'appel qui le découvre, au retour du parcours OAuth, quand La
   * Coop ne connaît encore que des jetons fraîchement échangés. Les jetons étant
   * neufs, aucun renouvellement n'est tenté.
   */
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

  /** Webhooks de La Coop posés sur cette organisation, à l'exclusion des autres. */
  readonly listerWebhooksDeLaCoop: (
    compte: CompteRdvUtilisable,
    organisationId: OrganisationId,
  ) => Promise<Result<readonly WebhookInstalle[], ErreurRdvApi>>

  /**
   * Pose un webhook. RDV Service Public accepte l'appel même quand l'agent n'est
   * pas administrateur de l'organisation, sans rien créer : la réussite se
   * vérifie en relisant, pas au code de retour.
   */
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

  /**
   * Obtient un nouveau jeu de jetons. La persistance n'en fait pas partie :
   * l'adaptateur ne connaît pas la base, et c'est l'appelant qui décide de
   * l'enregistrer — ou de basculer le compte en erreur si l'échange échoue.
   */
  readonly renouvelerJetons: (
    compte: CompteRdvUtilisable,
  ) => Promise<Result<JetonsOAuth, ErreurRdvApi>>
}
