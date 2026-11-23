'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { effacerNotes } from '@/features/activites/abilities/effacer-notes'
import { withAdmin, withAuth } from '@/features/authentification'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille'
import { detacherDesEquipes } from '@/features/equipe'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques'
import { effacerEmpreinteRdv } from '@/features/rdvsp/abilities/effacer-empreinte-rdv'
import { synchroniserPersonne } from '@/features/registre-des-personnes'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte'
import {
  hash,
  retirerDesListesDeDiffusion,
  SUPPRIMER_COMPTE_ERRORS,
  type SupprimerComptePorts,
  SupprimerCompteValidation,
  supprimerCompte,
} from '@/features/utilisateurs/abilities/supprimer-compte'
import { AuteurId, UtilisateurId } from '@/features/utilisateurs/domain'
import { fromResult, withInput } from '@/libraries/nextjs'

const supprimerComptePorts: SupprimerComptePorts = {
  anonymiserPortefeuille,
  effacerNotes,
  effacerEmpreinteRdv,
  retirerLesTagsDUnCompte,
  detacherDesEquipes,
  retirerDesLieux,
  revoquerPartageStatistiques,
  retirerDesListesDeDiffusion,
  hash,
}

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
          ports: supprimerComptePorts,
          synchroniserLaPersonne: synchroniserPersonne,
        }),
      { onError: SUPPRIMER_COMPTE_ERRORS },
    ),
  )
