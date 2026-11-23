import type { CodeAutorisation } from '@/features/rdvsp/abilities/connecter-compte-rdv/domain/code-autorisation'
import type { CodeAutorisationRefuse } from '@/features/rdvsp/abilities/connecter-compte-rdv/domain/errors'
import { EmailAgentDifferent } from '@/features/rdvsp/abilities/connecter-compte-rdv/domain/errors'
import type {
  CompteRdv,
  CompteRdvLie,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import type { JetonsOAuth } from '@/features/rdvsp/domain/compte/jetons-oauth'
import type { ErreurRdvApi } from '@/features/rdvsp/domain/errors'
import type { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import type { EmailExterne } from '@/features/rdvsp/domain/identite'
import type { RdvServicePublicApi } from '@/features/rdvsp/domain/ports'
import type { Result } from '@/libraries/result'
import { failure, success } from '@/libraries/result'

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
  inclureRdvsDansActivites: existant?.inclureRdvsDansActivites ?? true,
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

export type DependancesConnecterCompteRdv = {
  readonly echangerCode: EchangerCodeAutorisation
  readonly identifierAgent: RdvServicePublicApi['identifierAgent']
  readonly compteExistant: CompteRdvExistant
  readonly enregistrer: EnregistrerCompteConnecte
  readonly maintenant?: () => Date
}

/**
 * Enchaîne les quatre temps de la liaison : échanger le code, identifier
 * l'agent, vérifier qu'il s'agit bien du même e-mail que le compte La Coop, puis
 * enregistrer. Chaque étape peut échouer et son échec remonte tel quel : c'est
 * ce qui permettra à la route de callback de nommer précisément ce qui n'a pas
 * marché, au lieu du `server_error` générique d'aujourd'hui.
 *
 * La synchronisation des rendez-vous n'en fait pas partie : elle est déclenchée
 * après coup, sans bloquer la redirection de l'utilisateur.
 */
export const connecterCompteRdv =
  ({
    echangerCode,
    identifierAgent,
    compteExistant,
    enregistrer,
    maintenant = () => new Date(),
  }: DependancesConnecterCompteRdv): ConnecterCompteRdv =>
  async ({ utilisateurId, emailUtilisateur, code }) => {
    const jetons = await echangerCode(code)

    if (!jetons.success) {
      return jetons
    }

    const agent = await identifierAgent(jetons.data)

    if (!agent.success) {
      return agent
    }

    if (!emailsCorrespondent(emailUtilisateur, agent.data.email)) {
      return failure(EmailAgentDifferent(emailUtilisateur, agent.data.email))
    }

    const existant = await compteExistant({
      agentId: agent.data.id,
      utilisateurId,
    })

    const compte = compteApresConnexion({
      existant,
      agentId: agent.data.id,
      utilisateurId,
      jetons: jetons.data,
      maintenant: maintenant(),
    })

    return success(
      await enregistrer({
        compte,
        agentIdPrecedent: existant?.agentId ?? null,
      }),
    )
  }
