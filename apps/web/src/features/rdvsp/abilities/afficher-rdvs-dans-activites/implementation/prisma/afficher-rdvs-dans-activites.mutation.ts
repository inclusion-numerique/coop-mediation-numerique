import { failure, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import {
  type AfficherRdvsDansActivites,
  CompteRdvIntrouvable,
} from '../../domain/afficher-rdvs-dans-activites'

/**
 * La préférence est écrite sur le compte de l'utilisateur de session, désigné
 * par `userId` — unique sur `rdv_accounts` (AB-3). L'ancienne procédure tRPC
 * recevait l'identifiant du compte depuis le navigateur, et devait donc vérifier
 * qu'il était bien le sien ; ne pas le demander supprime la vérification.
 */
export const afficherRdvsDansActivites: AfficherRdvsDansActivites = async ({
  utilisateurId,
  afficher,
}) => {
  const { count } = await prismaClient.rdvAccount.updateMany({
    where: { userId: utilisateurId },
    data: { includeRdvsInActivitesList: afficher },
  })

  return count === 0 ? failure(CompteRdvIntrouvable()) : success(undefined)
}
