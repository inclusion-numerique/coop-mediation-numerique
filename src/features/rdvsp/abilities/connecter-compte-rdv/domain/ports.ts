import type { Result } from '@/libraries/result'
import type { CompteRdv } from '../../../domain/compte/compte-rdv'
import type { JetonsOAuth } from '../../../domain/compte/jetons-oauth'
import type { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { RdvServicePublicApi } from '../../../domain/ports'
import type { CodeAutorisation } from './code-autorisation'
import type { CompteConnecte } from './compte-connecte'
import type { EchecDeConnecterCompteRdv } from './errors'

export type EchangerCodeAutorisation = (
  code: CodeAutorisation,
) => Promise<Result<JetonsOAuth, EchecDeConnecterCompteRdv>>

export type CompteRdvExistant = (criteres: {
  readonly agentId: RdvAgentId
  readonly utilisateurId: UtilisateurCoopId
}) => Promise<CompteRdv | null>

export type EnregistrerCompteConnecte = (
  connexion: CompteConnecte,
) => Promise<void>

export type ConnecterCompteRdvPorts = {
  readonly echangerCode: EchangerCodeAutorisation
  readonly identifierAgent: RdvServicePublicApi['identifierAgent']
  readonly compteExistant: CompteRdvExistant
  readonly enregistrer: EnregistrerCompteConnecte
}
