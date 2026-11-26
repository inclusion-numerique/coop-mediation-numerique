import type {
  CompteRdv,
  CompteRdvLie,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import type { JetonsOAuth } from '@/features/rdvsp/domain/compte/jetons-oauth'
import type { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import type { EmailExterne } from '@/features/rdvsp/domain/identite'
import type { Result } from '@/libraries/result'
import { failure, success } from '@/libraries/result'
import type { CodeAutorisation } from './code-autorisation'
import type { CompteConnecte } from './compte-connecte'
import { type EchecDeConnecterCompteRdv, EmailAgentDifferent } from './errors'
import type { ConnecterCompteRdvPorts } from './ports'

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
const compteApresConnexion = ({
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
const emailsCorrespondent = (
  emailUtilisateur: EmailExterne,
  emailAgent: EmailExterne,
): boolean => emailUtilisateur === emailAgent

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
  }: ConnecterCompteRdvPorts) =>
  async ({
    utilisateurId,
    emailUtilisateur,
    code,
    maintenant,
  }: {
    readonly utilisateurId: UtilisateurCoopId
    readonly emailUtilisateur: EmailExterne
    readonly code: CodeAutorisation
    readonly maintenant: Date
  }): Promise<Result<CompteConnecte, EchecDeConnecterCompteRdv>> => {
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

    const connexion: CompteConnecte = {
      compte: compteApresConnexion({
        existant,
        agentId: agent.data.id,
        utilisateurId,
        jetons: jetons.data,
        maintenant,
      }),
      agentIdPrecedent: existant?.agentId ?? null,
    }

    await enregistrer(connexion)

    return success(connexion)
  }
