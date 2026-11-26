'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { effacerNotes } from '@/features/activites/abilities/effacer-notes/implementations/prisma/effacer-notes.mutation'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille/implementations/prisma/anonymiser-portefeuille.mutation'
import { compteADetacher } from '@/features/equipe/abilities/detacher-des-equipes/domain/detachement'
import { detacherDesEquipes as detacherDesEquipesAvec } from '@/features/equipe/abilities/detacher-des-equipes/domain/detacher-des-equipes'
import { retirerDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes/implementations/prisma/retirer-des-equipes.mutation'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux/implementations/prisma/retirer-des-lieux.mutation'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/domain/revoquer-partage-statistiques'
import { revoquerLesPartages } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/implementations/prisma/revoquer-partage-statistiques.mutation'
import { effacerEmpreinteRdv } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/domain/effacer-empreinte-rdv'
import { effacementPourLaSuppressionDeCompte } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/prisma/effacement-pour-la-suppression-de-compte.adapter'
import {
  supprimerLeCompteRdv,
  supprimerLesUsagers,
} from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/prisma/effacer-empreinte-rdv.mutation'
import {
  compteAEffacer,
  rendezVousDuCompte,
  usagersOrphelinsParmi,
} from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/prisma/effacer-empreinte-rdv.query'
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
import { role } from '@/features/tags/domain'
import type { RelancerLesInscritsInactifsPorts } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/domain'
import { relancerLesInscritsInactifs } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/domain/relancer-les-inscrits-inactifs'
import { relancesDesInscritsParCourriel } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/email/relances-des-inscrits-par-courriel.adapter'
import { inscritsSansProduction } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/prisma/inscrits-sans-production.query'
import { RetentionPolicy } from '@/features/utilisateurs/abilities/supprimer-compte/domain/index'
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
import {
  SuppressionRefusee,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { compterLesInscrits } from '@/features/utilisateurs/implementations/prisma/compter-les-inscrits.query'
import { noterLaRelance } from '@/features/utilisateurs/implementations/prisma/noter-la-relance.mutation'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { failure } from '@/libraries/result'

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

const supprimerUnInscritJamaisActifAvec =
  (
    effacements: EffacementsDesAutresFeatures,
    synchroniserLaPersonne: SynchroniserLaPersonne,
  ) =>
  async ({
    utilisateurId,
    maintenant,
  }: {
    readonly utilisateurId: UtilisateurId
    readonly maintenant: Date
  }) => {
    const suppression = await supprimerCompte(
      portsDeSuppression(effacements, synchroniserLaPersonne),
    )({
      cible: utilisateurId,
      auteur: {
        _tag: 'systeme',
        policy: RetentionPolicy('InscritJamaisActif'),
      },
      maintenant,
    })
    return suppression.success
      ? suppression
      : failure(SuppressionRefusee(suppression.error._tag))
  }

const lancerLesRelancesDesInscrits = async (
  maintenant: Date,
  supprimerLeCompte: RelancerLesInscritsInactifsPorts['supprimerLeCompte'],
) =>
  (
    await relancerLesInscritsInactifs({
      ...relancesDesInscritsParCourriel(await compterLesInscrits()),
      lireLesComptesARelancer: inscritsSansProduction,
      noterLaRelance: noterLaRelance('Nouveau'),
      supprimerLeCompte,
    })({ maintenant })
  ).data

const effacerLEmpreinteRdv = effacementPourLaSuppressionDeCompte(
  effacerEmpreinteRdv({
    compteAEffacer,
    revoquerJetons: revoquerJetons(configurationOAuthRdvsp()),
    rendezVousDuCompte,
    supprimerLeCompte: supprimerLeCompteRdv,
    usagersOrphelinsParmi,
    supprimerLesUsagers,
  }),
)

const detacherDesEquipes: EffacementsDesAutresFeatures['detacherDesEquipes'] =
  async (identifiants) => {
    const detachement = await detacherDesEquipesAvec({ retirerDesEquipes })({
      compte: compteADetacher(identifiants),
      maintenant: new Date(),
    })
    return detachement.data.bilan
  }

const supprimerComptePorts: EffacementsDesAutresFeatures = {
  anonymiserPortefeuille,
  effacerNotes,
  effacerEmpreinteRdv: effacerLEmpreinteRdv,
  retirerLesTagsDUnCompte: async (identifiants) => {
    const retrait = await retirerLesTags({
      compte: role(identifiants.mediateurId, identifiants.coordinateurId),
      maintenant: new Date(),
    })
    return bilanDuRetrait(retrait.data)
  },
  detacherDesEquipes,
  retirerDesLieux,
  revoquerPartageStatistiques: async (identifiants) => {
    const revocation = await revoquerLePartage({
      ...identifiants,
      maintenant: new Date(),
    })
    return { partagesRevoques: revocation.data.partagesRevoques }
  },
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
          supprimerUnInscritJamaisActifAvec(
            supprimerComptePorts,
            synchroniserPersonne,
          ),
        )
      ).length,
    }
  })
