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

const emailsCorrespondent = (
  emailUtilisateur: EmailExterne,
  emailAgent: EmailExterne,
): boolean => emailUtilisateur === emailAgent

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
