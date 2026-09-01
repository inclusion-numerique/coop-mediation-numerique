'use server'

import { effacerNotes } from '@app/web/features/activites/abilities/effacer-notes'
import { withAdmin, withAuth } from '@app/web/features/authentification'
import { anonymiserPortefeuille } from '@app/web/features/beneficiaire/abilities/anonymiser-portefeuille'
import { detacherDesEquipes } from '@app/web/features/equipe'
import { retirerDesLieux } from '@app/web/features/lieux-activite/abilities/retirer-des-lieux'
import { revoquerPartageStatistiques } from '@app/web/features/mediateurs/abilities/revoquer-partage-statistiques'
import { effacerEmpreinteRdv } from '@app/web/features/rdvsp/abilities/effacer-empreinte-rdv'
import {
  hash,
  retirerDesListesDeDiffusion,
  SUPPRIMER_COMPTE_ERRORS,
  SupprimerCompteValidation,
  supprimerCompte,
} from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import {
  AuteurId,
  identifiantsDe,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

/**
 * Suppression d'un compte par un administrateur.
 *
 * L'auteur est distinct de la cible, et leurs identifiants portent des marques
 * différentes : intervertir les deux ne compile pas.
 */
export const supprimerCompteAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(SupprimerCompteValidation))
  .execute(
    fromResult(
      ({ input, user }) =>
        supprimerCompte({
          command: {
            cible: UtilisateurId(input.utilisateurId),
            auteur: {
              _tag: 'administrateur',
              administrateurId: AuteurId(user.id),
            },
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
