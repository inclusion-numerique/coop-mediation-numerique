'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { effacerNotes } from '@/features/activites/abilities/effacer-notes/implementations/prisma/effacer-notes.mutation'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille/implementations/prisma/anonymiser-portefeuille.mutation'
import { detacherDesEquipes as detacherDesEquipesAvec } from '@/features/equipe/abilities/detacher-des-equipes/domain/detacher-des-equipes'
import { retirerDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes/implementations/prisma/retirer-des-equipes.mutation'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux/implementations/prisma/retirer-des-lieux.mutation'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/implementations/prisma/revoquer-partage-statistiques.mutation'
import { effacerEmpreinteRdvAvec } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/prisma/effacer-empreinte-rdv.mutation'
import { configurationOAuthRdvsp } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { revoquerJetons } from '@/features/rdvsp/implementations/api/revoquer-jetons.mutation'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/implementations/prisma/retirer-les-tags-d-un-compte.mutation'
import { SUPPRIMER_COMPTE_ERRORS } from '@/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.errors'
import { SupprimerCompteValidation } from '@/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.validation'
import type {
  EffacementsDesAutresFeatures,
  SupprimerCompteDependances,
} from '@/features/utilisateurs/abilities/supprimer-compte/domain/ports'
import { supprimerCompte } from '@/features/utilisateurs/abilities/supprimer-compte/domain/supprimer-compte'
import { retirerDesListesDeDiffusion } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/brevo/retirer-des-listes-de-diffusion.mutation'
import { hash } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/crypto/hash.adapter'
import { compteASupprimer } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/compte-a-supprimer.query'
import { couperAcces } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/couper-acces.mutation'
import { logEffacementReport } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/log-effacement-report.mutation'
import { AuteurId, UtilisateurId } from '@/features/utilisateurs/domain'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'

const dependancesDe = (
  effacements: EffacementsDesAutresFeatures,
  synchroniserLaPersonne: SynchroniserLaPersonne,
): SupprimerCompteDependances => ({
  ...effacements,
  retirerDesListesDeDiffusion,
  hash,
  lireLeCompteASupprimer: compteASupprimer,
  couperLAcces: couperAcces(synchroniserLaPersonne),
  journaliserLEffacement: logEffacementReport,
})

const supprimerCompteAvec = (
  effacements: EffacementsDesAutresFeatures,
  synchroniserLaPersonne: SynchroniserLaPersonne,
) => supprimerCompte(dependancesDe(effacements, synchroniserLaPersonne))

const effacerEmpreinteRdv = effacerEmpreinteRdvAvec(
  revoquerJetons(configurationOAuthRdvsp()),
)

const detacherDesEquipes: EffacementsDesAutresFeatures['detacherDesEquipes'] =
  async (identifiants) => {
    const detachement = await detacherDesEquipesAvec({ retirerDesEquipes })({
      ...identifiants,
      maintenant: new Date(),
    })
    return detachement.success ? detachement.data.bilan : detachement.error
  }

const supprimerComptePorts: EffacementsDesAutresFeatures = {
  anonymiserPortefeuille,
  effacerNotes,
  effacerEmpreinteRdv,
  retirerLesTagsDUnCompte,
  detacherDesEquipes,
  retirerDesLieux,
  revoquerPartageStatistiques,
}

export const supprimerCompteAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(SupprimerCompteValidation))
  .execute(
    fromResult(
      ({ input, user }) =>
        supprimerCompteAvec(
          supprimerComptePorts,
          synchroniserPersonne,
        )({
          cible: UtilisateurId(input.utilisateurId),
          auteur: {
            _tag: 'administrateur',
            administrateurId: AuteurId(user.id),
          },
          maintenant: new Date(),
        }),
      { onError: SUPPRIMER_COMPTE_ERRORS },
    ),
  )
