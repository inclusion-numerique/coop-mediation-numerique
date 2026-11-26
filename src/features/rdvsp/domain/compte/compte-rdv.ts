import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { OrganisationId } from '../identifiants/organisation-id'
import type { RdvAgentId } from '../identifiants/rdv-agent-id'
import type { UtilisateurCoopId } from '../identifiants/utilisateur-coop-id'
import type { JetonsOAuth } from './jetons-oauth'

export const MessageErreurCompte = defineModel(
  z.string().trim().min(1).brand('MessageErreurCompte'),
)
export type MessageErreurCompte = Model.TypeOf<typeof MessageErreurCompte>

type CompteRdvBase = {
  readonly agentId: RdvAgentId
  readonly utilisateurId: UtilisateurCoopId
  readonly organisationIds: readonly OrganisationId[]
  readonly organisationIdsSansWebhook: readonly OrganisationId[]
  readonly synchroniserDepuis: Date | null
  readonly derniereSynchro: Date | null
  readonly inclureRdvsDansActivites: boolean
}

type CompteRdvNonLie = CompteRdvBase & {
  readonly _tag: 'nonLie'
}

export type CompteRdvLie = CompteRdvBase & {
  readonly _tag: 'lie'
  readonly jetons: JetonsOAuth
}

type CompteRdvEnErreur = CompteRdvBase & {
  readonly _tag: 'enErreur'
  readonly jetons: JetonsOAuth
  readonly erreur: MessageErreurCompte
}

export type CompteRdvDeconnecte = CompteRdvBase & {
  readonly _tag: 'deconnecte'
  readonly deconnexion: Date
}

export type CompteRdv =
  | CompteRdvNonLie
  | CompteRdvLie
  | CompteRdvEnErreur
  | CompteRdvDeconnecte

export type CompteRdvUtilisable = CompteRdvLie | CompteRdvEnErreur

export const estUtilisable = (
  compte: CompteRdv,
): compte is CompteRdvUtilisable =>
  compte._tag === 'lie' || compte._tag === 'enErreur'
