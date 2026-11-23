'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { effacerNotes } from '@/features/activites/abilities/effacer-notes/implementations/prisma/effacer-notes.mutation'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille/implementations/prisma/anonymiser-portefeuille.mutation'
import { detacherDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes/implementations/prisma/detacher-des-equipes.mutation'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux/implementations/prisma/retirer-des-lieux.mutation'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/implementations/prisma/revoquer-partage-statistiques.mutation'
import { effacerEmpreinteRdv } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/effacer-empreinte-rdv.binding'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/implementations/prisma/retirer-les-tags-d-un-compte.mutation'
import { SUPPRIMER_COMPTE_ERRORS } from '@/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.errors'
import { SupprimerCompteValidation } from '@/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.validation'
import { supprimerCompte } from '@/features/utilisateurs/abilities/supprimer-compte/commands/supprimer-compte'
import { type SupprimerComptePorts } from '@/features/utilisateurs/abilities/supprimer-compte/domain/index'
import { retirerDesListesDeDiffusion } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/brevo/retirer-des-listes-de-diffusion'
import { hash } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/crypto/hash'
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
