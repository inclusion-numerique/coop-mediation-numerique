import { failure, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { compteRdvFromDomain, compteRdvToDomain } from '../../../../db'
import type { DeconnecterCompteRdv } from '../../domain/deconnecter-compte-rdv'
import { compteApresDeconnexion } from '../../domain/deconnecter-compte-rdv'
import { CompteRdvIntrouvable } from '../../domain/errors'

/**
 * La lecture est portée par `userId` seul : un médiateur ne peut délier que son
 * propre compte, et `rdv_accounts.user_id` est unique (AB-3).
 *
 * La requête est locale à l'ability plutôt que reprise de `connecter-compte-rdv`,
 * qui cherche par agent **ou** par utilisateur : la déconnexion n'a pas ce besoin,
 * et partager la requête coûterait un couplage entre abilities pour économiser
 * quatre lignes (IS-1).
 */
export const deconnecterCompteRdv =
  (maintenant: () => Date = () => new Date()): DeconnecterCompteRdv =>
  async ({ utilisateurId }) => {
    const row = await prismaClient.rdvAccount.findUnique({
      where: { userId: utilisateurId },
      include: { organisations: { select: { organisationId: true } } },
    })

    if (row === null) {
      return failure(CompteRdvIntrouvable(utilisateurId))
    }

    const compte = compteApresDeconnexion(compteRdvToDomain(row), maintenant())

    // Les jetons sont purgés du seul fait que la branche `deconnecte` n'en porte
    // aucun : le transfer les écrit à `null`, sans qu'aucune liste de colonnes à
    // effacer n'ait à être tenue à jour ici.
    await prismaClient.rdvAccount.update({
      where: { id: compte.agentId },
      data: compteRdvFromDomain(compte),
    })

    return success(compte)
  }
