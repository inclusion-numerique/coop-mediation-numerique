import 'server-only'

import { deleteBrevoContactIfOrphan } from '@app/web/external-apis/brevo/deleteBrevoContactIfOrphan'
import {
  deploymentCanRemoveBrevoContactFromList,
  removeBrevoContactFromList,
} from '@app/web/external-apis/brevo/removeBrevoContactFromList'
import { effacerNotes } from '@app/web/features/activites/abilities/effacer-notes'
import { anonymiserPortefeuille } from '@app/web/features/beneficiaire/abilities/anonymiser-portefeuille'
import { libererDesEquipes } from '@app/web/features/equipe'
import { retirerDesLieux } from '@app/web/features/lieux-activite/abilities/retirer-des-lieux'
import { revoquerPartageStatistiques } from '@app/web/features/mediateurs/abilities/revoquer-partage-statistiques'
import { effacerEmpreinteCompte } from '@app/web/features/rdvsp/abilities/effacer-empreinte-compte'
import {
  type ChargesEffacement,
  VolumeEfface,
} from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import type { RattachementsDuCompte } from '@app/web/features/utilisateurs/domain'
import {
  coordinateurDe,
  mediateurDe,
} from '@app/web/features/utilisateurs/domain'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'

/**
 * Composition de l'effacement d'un compte.
 *
 * C'est LE seul endroit du produit qui connaisse à la fois les sept contrats
 * exigés par `supprimer-compte` et les six features qui les honorent. La feature
 * `utilisateurs` ne dépend d'aucune autre : elle déclare ce dont elle a besoin,
 * et l'application y branche des implémentations.
 *
 * Chaque fonction ci-dessous ne fait que deux choses — dénuder les identifiants
 * brandés, que les features destinataires n'ont pas à connaître, et rebrander
 * les volumes rendus. Aucune logique d'effacement ne vit ici ; elle est toujours
 * chez le propriétaire de la donnée.
 */

/**
 * Les rattachements arrivent en union discriminée — le domaine refuse de
 * représenter « ni médiateur ni coordinateur » autrement. Les features
 * destinataires, elles, ne connaissent que des identifiants.
 */
const denuder = (rattachements: RattachementsDuCompte) => ({
  mediateurId: mediateurDe(rattachements),
  coordinateurId: coordinateurDe(rattachements),
})

export const chargesEffacement: ChargesEffacement = {
  anonymiserPortefeuille: async ({ mediateurId }) => {
    const { anonymises } = await anonymiserPortefeuille({ mediateurId })
    return { anonymises: VolumeEfface(anonymises) }
  },

  effacerNotesDesAccompagnements: async ({ rattachements }) => {
    const { effacees } = await effacerNotes(denuder(rattachements))
    return { effacees: VolumeEfface(effacees) }
  },

  effacerEmpreinteRdv: async ({ utilisateurId }) => {
    const bilan = await effacerEmpreinteCompte({ utilisateurId })
    return {
      compteDelie: bilan.compteDelie,
      rdvsExpurges: VolumeEfface(bilan.rdvsExpurges),
      usagersSupprimes: VolumeEfface(bilan.usagersSupprimes),
    }
  },

  libererDesEquipes: async ({ rattachements }) => {
    const bilan = await libererDesEquipes(denuder(rattachements))
    return {
      invitationsSupprimees: VolumeEfface(bilan.invitationsSupprimees),
      appartenancesSupprimees: VolumeEfface(bilan.appartenancesSupprimees),
      tagsTransferes: VolumeEfface(bilan.tagsTransferes),
      tagsSupprimes: VolumeEfface(bilan.tagsSupprimes),
    }
  },

  retirerDesLieuxActivite: async ({ mediateurId }) => {
    const { rattachementsSupprimes } = await retirerDesLieux({ mediateurId })
    return { rattachementsSupprimes: VolumeEfface(rattachementsSupprimes) }
  },

  revoquerPartageStatistiques: async ({ rattachements }) => {
    const { partagesRevoques } = await revoquerPartageStatistiques(
      denuder(rattachements),
    )
    return { partagesRevoques: VolumeEfface(partagesRevoques) }
  },

  /**
   * Brevo n'est pas joignable depuis tous les déploiements : les environnements
   * de prévisualisation partagent la liste de production, et y retirer un
   * contact désabonnerait quelqu'un de bien réel. L'abstention est donc un
   * succès sans effet, pas un échec.
   */
  retirerDesListesDeDiffusion: async ({ courriel }) => {
    if (!deploymentCanRemoveBrevoContactFromList()) {
      return { contactSupprime: false }
    }

    await removeBrevoContactFromList(
      courriel,
      ServerWebAppConfig.Brevo.usersListId,
    )
    await deleteBrevoContactIfOrphan(courriel)

    return { contactSupprime: true }
  },
}
