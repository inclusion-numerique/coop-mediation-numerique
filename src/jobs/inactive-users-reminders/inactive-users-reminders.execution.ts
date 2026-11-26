import { effacerNotes } from '@/features/activites/abilities/effacer-notes/implementations/prisma/effacer-notes.mutation'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille/implementations/prisma/anonymiser-portefeuille.mutation'
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
import {
  retirerDuRegistre,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { bilanDuRetrait } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/domain'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/domain/retirer-les-tags-d-un-compte'
import { appliquerLeRetraitDesTags } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/implementations/prisma/retirer-les-tags-d-un-compte.mutation'
import {
  lireLesTagsDetenus,
  lireLesTagsDuCompte,
} from '@/features/tags/abilities/retirer-les-tags-d-un-compte/implementations/prisma/tags-du-compte.query'
import { relancerLesInscriptionsInachevees } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/domain/relancer-les-inscriptions-inachevees'
import { retirerDesListes } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/brevo/retirer-des-listes.mutation'
import { relancesDInscriptionParCourriel } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/email/relances-d-inscription-par-courriel.adapter'
import { effacerLInscription } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/prisma'
import { inscriptionsInachevees } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/prisma/inscriptions-inachevees.query'
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
import type {
  RapportDeRelance,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { compterLesInscrits } from '@/features/utilisateurs/implementations/prisma/compter-les-inscrits.query'
import { noterLaRelance } from '@/features/utilisateurs/implementations/prisma/noter-la-relance.mutation'
import type {
  RetirerDuRegistre,
  SynchroniserLaPersonne,
} from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { output } from '@/libraries/console'

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
  ({
    utilisateurId,
    maintenant,
  }: {
    readonly utilisateurId: UtilisateurId
    readonly maintenant: Date
  }) =>
    supprimerCompte(portsDeSuppression(effacements, synchroniserLaPersonne))({
      cible: utilisateurId,
      auteur: {
        _tag: 'systeme',
        policy: RetentionPolicy('InscritJamaisActif'),
      },
      maintenant,
    })

const lancerLesRelancesDesInscrits = async (
  maintenant: Date,
  supprimerLeCompte: RelancerLesInscritsInactifsPorts['supprimerLeCompte'],
) => {
  const resultat = await relancerLesInscritsInactifs({
    ...relancesDesInscritsParCourriel(await compterLesInscrits()),
    lireLesComptesARelancer: inscritsSansProduction,
    noterLaRelance: noterLaRelance('Nouveau'),
    supprimerLeCompte,
  })({ maintenant })
  return resultat.data
}

const lancerLesRelancesDInscription = async (
  maintenant: Date,
  retirerDuRegistre: RetirerDuRegistre,
) => {
  const resultat = await relancerLesInscriptionsInachevees({
    ...relancesDInscriptionParCourriel(await compterLesInscrits()),
    lireLesComptesARelancer: inscriptionsInachevees,
    noterLaRelance: noterLaRelance('Inscription'),
    effacerLInscription: effacerLInscription(retirerDuRegistre),
    retirerDesListes,
  })({ maintenant })
  return resultat.data
}

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
      ...identifiants,
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
      ...identifiants,
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

const resume = (rapports: readonly RapportDeRelance[]) => ({
  traites: rapports.length,
  echecs: rapports.flatMap((rapport) =>
    rapport.issue === 'echec'
      ? [
          {
            utilisateurId: rapport.utilisateurId,
            action: rapport.action._tag,
            cause: rapport.cause,
          },
        ]
      : [],
  ),
})

export const executeInactiveUsersReminders = async () => {
  output('Executing inactive users reminders job...')

  const maintenant = new Date()
  const inscriptions = resume(
    await lancerLesRelancesDInscription(maintenant, retirerDuRegistre),
  )
  const inscrits = resume(
    await lancerLesRelancesDesInscrits(
      maintenant,
      supprimerUnInscritJamaisActifAvec(
        supprimerComptePorts,
        synchroniserPersonne,
      ),
    ),
  )

  output(
    `relances : ${inscriptions.traites} inscriptions inachevées (${inscriptions.echecs.length} échecs), ${inscrits.traites} inscrits sans activité (${inscrits.echecs.length} échecs)`,
  )

  return { success: true, inscriptions, inscrits }
}
