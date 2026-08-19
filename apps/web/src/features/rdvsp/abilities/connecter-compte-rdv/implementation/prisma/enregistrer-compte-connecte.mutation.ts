import { prismaClient } from '@app/web/prismaClient'
import { compteRdvFromDomain } from '../../../../db'
import type { EnregistrerCompteConnecte } from '../../domain/connecter-compte-rdv'

/**
 * `rdv_accounts` a pour clé primaire l'identifiant de l'agent : reconnecter un
 * médiateur sur un autre agent déplace donc la ligne d'une clé à l'autre, ce que
 * l'upsert exprime en ciblant `agentIdPrecedent` tout en écrivant le nouvel id.
 *
 * Les organisations ne sont pas réécrites ici : elles proviennent de la
 * synchronisation, qui suit la connexion. Les recopier depuis un domaine encore
 * vide effacerait le cache d'un compte qui se reconnecte.
 */
export const enregistrerCompteConnecte: EnregistrerCompteConnecte = async ({
  compte,
  agentIdPrecedent,
}) => {
  const colonnes = compteRdvFromDomain(compte)

  await prismaClient.rdvAccount.upsert({
    where: { id: agentIdPrecedent ?? compte.agentId },
    create: colonnes,
    update: colonnes,
  })

  // Le compte écrit est rendu tel quel plutôt que relu : la relecture donnerait
  // un `CompteRdv` qu'il faudrait re-restreindre à sa branche `lie`, et la
  // fidélité de l'aller-retour est déjà l'objet de `compte-rdv.transfer.spec`.
  return compte
}
