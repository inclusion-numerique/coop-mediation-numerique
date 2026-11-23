'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { effacerNotes } from '@/features/activites/abilities/effacer-notes/implementations/prisma/effacer-notes.mutation'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille/implementations/prisma/anonymiser-portefeuille.mutation'
import { detacherDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes/implementations/prisma/detacher-des-equipes.mutation'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux/implementations/prisma/retirer-des-lieux.mutation'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/implementations/prisma/revoquer-partage-statistiques.mutation'
import { effacerEmpreinteRdv } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/effacer-empreinte-rdv.binding'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/implementations/prisma/retirer-les-tags-d-un-compte.mutation'
import { SUPPRIMER_COMPTE_ERRORS } from '@/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.errors'
import type { EffacementsDesAutresFeatures } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/supprimer-compte.binding'
import { supprimerCompteAvec } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/supprimer-compte.binding'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { fromResult } from '@/libraries/nextjs'

const supprimerComptePorts: EffacementsDesAutresFeatures = {
  anonymiserPortefeuille,
  effacerNotes,
  effacerEmpreinteRdv,
  retirerLesTagsDUnCompte,
  detacherDesEquipes,
  retirerDesLieux,
  revoquerPartageStatistiques,
}

export const supprimerMonCompteAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(
    fromResult(
      ({ user }) =>
        supprimerCompteAvec(
          supprimerComptePorts,
          synchroniserPersonne,
        )({
          cible: UtilisateurId(user.id),
          auteur: { _tag: 'titulaire' },
          maintenant: new Date(),
        }),
      { onError: SUPPRIMER_COMPTE_ERRORS },
    ),
  )
