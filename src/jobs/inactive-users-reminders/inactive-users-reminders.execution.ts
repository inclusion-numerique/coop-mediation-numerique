import { effacerNotes } from '@/features/activites/abilities/effacer-notes/implementations/prisma/effacer-notes.mutation'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille/implementations/prisma/anonymiser-portefeuille.mutation'
import { detacherDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes/implementations/prisma/detacher-des-equipes.mutation'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux/implementations/prisma/retirer-des-lieux.mutation'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/implementations/prisma/revoquer-partage-statistiques.mutation'
import { effacerEmpreinteRdvAvec } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/prisma/effacer-empreinte-rdv.mutation'
import { configurationOAuthRdvsp } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { revoquerJetons } from '@/features/rdvsp/implementations/api/revoquer-jetons.mutation'
import {
  retirerDuRegistre,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/implementations/prisma/retirer-les-tags-d-un-compte.mutation'
import { relancerLesInscriptionsInachevees } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/domain/relancer-les-inscriptions-inachevees'
import { relancesDInscriptionParCourriel } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/email/relances-d-inscription-par-courriel.adapter'
import { effacerLInscription } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/prisma'
import { inscriptionsInachevees } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/prisma/inscriptions-inachevees.query'
import type { RelancerLesInscritsInactifsPorts } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/domain'
import { relancerLesInscritsInactifs } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/domain/relancer-les-inscrits-inactifs'
import { relancesDesInscritsParCourriel } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/email/relances-des-inscrits-par-courriel.adapter'
import { inscritsSansProduction } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/prisma/inscrits-sans-production.query'
import type {
  EffacementsDesAutresFeatures,
  SupprimerCompteDependances,
} from '@/features/utilisateurs/abilities/supprimer-compte/domain/ports'
import { supprimerUnInscritJamaisActif } from '@/features/utilisateurs/abilities/supprimer-compte/domain/supprimer-un-inscrit-jamais-actif'
import { retirerDesListesDeDiffusion } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/brevo/retirer-des-listes-de-diffusion.mutation'
import { hash } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/crypto/hash.adapter'
import { compteASupprimer } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/compte-a-supprimer.query'
import { couperAcces } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/couper-acces.mutation'
import { logEffacementReport } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/prisma/log-effacement-report.mutation'
import type { RapportDeRelance } from '@/features/utilisateurs/domain'
import { removeBrevoUserContact } from '@/features/utilisateurs/implementations/brevo/remove-brevo-user-contact.mutation'
import { compterLesInscrits } from '@/features/utilisateurs/implementations/prisma/compter-les-inscrits.query'
import { noterLaRelance } from '@/features/utilisateurs/implementations/prisma/noter-la-relance.mutation'
import type {
  RetirerDuRegistre,
  SynchroniserLaPersonne,
} from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { output } from '@/libraries/console'

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

const supprimerUnInscritJamaisActifAvec = (
  effacements: EffacementsDesAutresFeatures,
  maintenant: Date,
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  supprimerUnInscritJamaisActif(
    dependancesDe(effacements, synchroniserLaPersonne),
    maintenant,
  )

const lancerLesRelancesDesInscrits = async (
  maintenant: Date,
  supprimerLeCompte: RelancerLesInscritsInactifsPorts['supprimerLeCompte'],
) =>
  relancerLesInscritsInactifs({
    maintenant,
    ports: {
      ...relancesDesInscritsParCourriel(await compterLesInscrits()),
      lireLesComptesARelancer: inscritsSansProduction,
      noterLaRelance: noterLaRelance('Nouveau'),
      supprimerLeCompte,
    },
  })

const lancerLesRelancesDInscription = async (
  maintenant: Date,
  retirerDuRegistre: RetirerDuRegistre,
) =>
  relancerLesInscriptionsInachevees({
    maintenant,
    ports: {
      ...relancesDInscriptionParCourriel(await compterLesInscrits()),
      lireLesComptesARelancer: inscriptionsInachevees,
      noterLaRelance: noterLaRelance('Inscription'),
      effacerLInscription: effacerLInscription(retirerDuRegistre),
      retirerDesListes: async (courriel) => {
        await removeBrevoUserContact(courriel)
      },
    },
  })

const effacerEmpreinteRdv = effacerEmpreinteRdvAvec(
  revoquerJetons(configurationOAuthRdvsp()),
)

const supprimerComptePorts: EffacementsDesAutresFeatures = {
  anonymiserPortefeuille,
  effacerNotes,
  effacerEmpreinteRdv,
  retirerLesTagsDUnCompte,
  detacherDesEquipes,
  retirerDesLieux,
  revoquerPartageStatistiques,
}

const resume = (rapports: readonly RapportDeRelance[]) => ({
  traites: rapports.length,
  echecs: rapports.flatMap((rapport) =>
    rapport.issue === 'echec'
      ? [
          {
            utilisateurId: rapport.utilisateurId,
            action: rapport.action,
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
        maintenant,
        synchroniserPersonne,
      ),
    ),
  )

  output(
    `relances : ${inscriptions.traites} inscriptions inachevées (${inscriptions.echecs.length} échecs), ${inscrits.traites} inscrits sans activité (${inscrits.echecs.length} échecs)`,
  )

  return { success: true, inscriptions, inscrits }
}
