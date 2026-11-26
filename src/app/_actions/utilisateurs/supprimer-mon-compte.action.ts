'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { effacerNotes } from '@/features/activites/abilities/effacer-notes/implementations/prisma/effacer-notes.mutation'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille/implementations/prisma/anonymiser-portefeuille.mutation'
import { detacherDesEquipes as detacherDesEquipesAvec } from '@/features/equipe/abilities/detacher-des-equipes/domain/detacher-des-equipes'
import { retirerDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes/implementations/prisma/retirer-des-equipes.mutation'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux/implementations/prisma/retirer-des-lieux.mutation'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/domain/revoquer-partage-statistiques'
import { revoquerLesPartages } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/implementations/prisma/revoquer-partage-statistiques.mutation'
import { effacerEmpreinteRdvAvec } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/prisma/effacer-empreinte-rdv.mutation'
import { configurationOAuthRdvsp } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { revoquerJetons } from '@/features/rdvsp/implementations/api/revoquer-jetons.mutation'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { bilanDuRetrait } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/domain'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/domain/retirer-les-tags-d-un-compte'
import { appliquerLeRetraitDesTags } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/implementations/prisma/retirer-les-tags-d-un-compte.mutation'
import {
  lireLesTagsDetenus,
  lireLesTagsDuCompte,
} from '@/features/tags/abilities/retirer-les-tags-d-un-compte/implementations/prisma/tags-du-compte.query'
import { SUPPRIMER_COMPTE_ERRORS } from '@/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.errors'
import { supprimerCompte } from '@/features/utilisateurs/abilities/supprimer-compte/domain/supprimer-compte'
import { retirerDesListesDeDiffusion } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/brevo/retirer-des-listes-de-diffusion.mutation'
import { hash } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/crypto/hash.adapter'
import { compteASupprimer } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/compte-a-supprimer.query'
import { couperAcces } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/couper-acces.mutation'
import {
  type EffacementsDesAutresFeatures,
  effacementsAttrapes,
} from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/effacements-des-autres-features.adapter'
import { logEffacementReport } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/log-effacement-report.mutation'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { fromResult } from '@/libraries/nextjs'

const revoquerLePartage = revoquerPartageStatistiques({ revoquerLesPartages })

const retirerLesTags = retirerLesTagsDUnCompte({
  lireLesTagsDuCompte,
  lireLesTagsDetenus,
  appliquerLeRetrait: appliquerLeRetraitDesTags,
})

const portsDeSuppression = (
  effacements: EffacementsDesAutresFeatures,
  synchroniserLaPersonne: SynchroniserLaPersonne,
) => ({
  ...effacementsAttrapes(effacements),
  retirerDesListesDeDiffusion,
  hash,
  lireLeCompteASupprimer: compteASupprimer,
  couperLAcces: couperAcces(synchroniserLaPersonne),
  journaliserLEffacement: logEffacementReport,
})

const supprimerCompteAvec = (
  effacements: EffacementsDesAutresFeatures,
  synchroniserLaPersonne: SynchroniserLaPersonne,
) => supprimerCompte(portsDeSuppression(effacements, synchroniserLaPersonne))

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
  retirerLesTagsDUnCompte: async (identifiants) => {
    const retrait = await retirerLesTags({
      ...identifiants,
      maintenant: new Date(),
    })
    return retrait.success ? bilanDuRetrait(retrait.data) : retrait.error
  },
  detacherDesEquipes,
  retirerDesLieux,
  revoquerPartageStatistiques: async (identifiants) => {
    const revocation = await revoquerLePartage({
      ...identifiants,
      maintenant: new Date(),
    })
    return revocation.success
      ? { partagesRevoques: revocation.data.partagesRevoques }
      : revocation.error
  },
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
