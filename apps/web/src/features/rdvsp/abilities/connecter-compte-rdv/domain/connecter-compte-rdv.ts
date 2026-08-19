import type { Result } from '@app/web/libraries/result'
import type { CompteRdv, CompteRdvLie } from '../../../domain/compte-rdv'
import type { ErreurRdvApi } from '../../../domain/errors'
import type { EmailExterne } from '../../../domain/identite'
import type { JetonsOAuth } from '../../../domain/jetons-oauth'
import type { RdvAgentId } from '../../../domain/rdv-agent-id'
import type { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import type { CodeAutorisation } from './code-autorisation'
import type { CodeAutorisationRefuse, EmailAgentDifferent } from './errors'

export type ErreurConnexionCompte =
  | CodeAutorisationRefuse
  | EmailAgentDifferent
  | ErreurRdvApi

export type ConnecterCompteRdv = (input: {
  readonly utilisateurId: UtilisateurCoopId
  readonly emailUtilisateur: EmailExterne
  readonly code: CodeAutorisation
}) => Promise<Result<CompteRdvLie, ErreurConnexionCompte>>

/** Échange le code d'autorisation contre un premier jeu de jetons. */
export type EchangerCodeAutorisation = (
  code: CodeAutorisation,
) => Promise<Result<JetonsOAuth, ErreurConnexionCompte>>

/**
 * Recherche le compte à reprendre : soit celui déjà rattaché à cet utilisateur,
 * soit celui portant cet agent — un agent peut avoir été lié depuis un autre
 * compte La Coop, et les deux clés doivent converger.
 */
export type CompteRdvExistant = (criteres: {
  readonly agentId: RdvAgentId
  readonly utilisateurId: UtilisateurCoopId
}) => Promise<CompteRdv | null>

export type EnregistrerCompteConnecte = (input: {
  readonly compte: CompteRdvLie
  readonly agentIdPrecedent: RdvAgentId | null
}) => Promise<CompteRdvLie>

const debutDuJour = (maintenant: Date): Date =>
  new Date(
    maintenant.getFullYear(),
    maintenant.getMonth(),
    maintenant.getDate(),
  )

/**
 * État du compte au terme d'une connexion réussie.
 *
 * Trois règles y sont fixées. Une connexion rend toujours un compte `lie` :
 * elle efface l'erreur comme la déconnexion, une reconnexion OAuth n'ayant rien
 * de destructif. La fenêtre de synchronisation n'est posée qu'à la première
 * connexion — la reprendre à chaque fois ferait glisser l'historique importé, et
 * un médiateur qui se reconnecte perdrait ses rendez-vous antérieurs. Enfin les
 * réglages de l'utilisateur (affichage des rendez-vous dans les activités,
 * organisations connues) survivent, puisqu'il ne les a pas remis en cause.
 */
export const compteApresConnexion = ({
  existant,
  agentId,
  utilisateurId,
  jetons,
  maintenant,
}: {
  existant: CompteRdv | null
  agentId: RdvAgentId
  utilisateurId: UtilisateurCoopId
  jetons: JetonsOAuth
  maintenant: Date
}): CompteRdvLie => ({
  _tag: 'lie',
  agentId,
  utilisateurId,
  jetons,
  organisationIds: existant?.organisationIds ?? [],
  organisationIdsSansWebhook: existant?.organisationIdsSansWebhook ?? [],
  synchroniserDepuis: existant?.synchroniserDepuis ?? debutDuJour(maintenant),
  derniereSynchro: existant?.derniereSynchro ?? null,
  inclureRdvsDansActivites: existant?.inclureRdvsDansActivites ?? false,
})

/**
 * Les deux adresses sont normalisées par `EmailExterne` (trim + minuscules) :
 * la comparaison stricte suffit, et la casse ne peut plus faire échouer une
 * liaison légitime.
 */
export const emailsCorrespondent = (
  emailUtilisateur: EmailExterne,
  emailAgent: EmailExterne,
): boolean => emailUtilisateur === emailAgent
