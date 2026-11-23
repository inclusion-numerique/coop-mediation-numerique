'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { effacerNotes } from '@/features/activites/abilities/effacer-notes'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille'
import { detacherDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques'
import { effacerEmpreinteRdv } from '@/features/rdvsp/abilities/effacer-empreinte-rdv'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte'
import { lancerLesRelancesDesInscrits } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs'
import {
  hash,
  retirerDesListesDeDiffusion,
  type SupprimerComptePorts,
  supprimerUnInscritJamaisActif,
} from '@/features/utilisateurs/abilities/supprimer-compte'

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

export const relancerLesInscritsInactifsAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => {
    const maintenant = new Date()

    return {
      traites: (
        await lancerLesRelancesDesInscrits(
          maintenant,
          supprimerUnInscritJamaisActif(
            supprimerComptePorts,
            maintenant,
            synchroniserPersonne,
          ),
        )
      ).length,
    }
  })
