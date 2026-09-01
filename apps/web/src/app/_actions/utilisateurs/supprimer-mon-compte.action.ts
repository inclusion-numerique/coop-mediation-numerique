'use server'

import { effacerNotes } from '@app/web/features/activites/abilities/effacer-notes'
import { withAuth } from '@app/web/features/authentification'
import { anonymiserPortefeuille } from '@app/web/features/beneficiaire/abilities/anonymiser-portefeuille'
import { detacherDesEquipes } from '@app/web/features/equipe'
import { retirerDesLieux } from '@app/web/features/lieux-activite/abilities/retirer-des-lieux'
import { revoquerPartageStatistiques } from '@app/web/features/mediateurs/abilities/revoquer-partage-statistiques'
import { effacerEmpreinteRdv } from '@app/web/features/rdvsp/abilities/effacer-empreinte-rdv'
import {
  hash,
  retirerDesListesDeDiffusion,
  SUPPRIMER_COMPTE_ERRORS,
  supprimerCompte,
} from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import {
  identifiantsDe,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { actionBuilder, fromResult } from '@app/web/libraries/nextjs'

/**
 * Suppression de son propre compte.
 *
 * La cible vient de la session et jamais de l'input : personne ne peut demander
 * la suppression d'un autre par ce chemin.
 */
export const supprimerMonCompteAction = actionBuilder()
  .use(withAuth())
  .execute(
    fromResult(
      ({ user }) =>
        supprimerCompte({
          command: {
            cible: UtilisateurId(user.id),
            auteur: { _tag: 'titulaire' },
            maintenant: new Date(),
          },
          ports: {
            anonymiserPortefeuille,
            effacerEmpreinteRdv,
            retirerDesLieux,
            effacerNotes: ({ rattachements }) =>
              effacerNotes(identifiantsDe(rattachements)),
            detacherDesEquipes: ({ rattachements }) =>
              detacherDesEquipes(identifiantsDe(rattachements)),
            revoquerPartageStatistiques: ({ rattachements }) =>
              revoquerPartageStatistiques(identifiantsDe(rattachements)),
            retirerDesListesDeDiffusion,
            hash,
          },
        }),
      { onError: SUPPRIMER_COMPTE_ERRORS },
    ),
  )
