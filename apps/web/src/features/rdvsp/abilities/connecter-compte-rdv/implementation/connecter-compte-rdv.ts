import { failure, success } from '@app/web/libraries/result'
import type { RdvServicePublicApi } from '../../../domain/rdv-service-public.port'
import {
  type CompteRdvExistant,
  type ConnecterCompteRdv,
  compteApresConnexion,
  type EchangerCodeAutorisation,
  type EnregistrerCompteConnecte,
  emailsCorrespondent,
} from '../domain/connecter-compte-rdv'
import { EmailAgentDifferent } from '../domain/errors'

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
