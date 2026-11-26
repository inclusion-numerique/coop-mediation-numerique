import { effacerNotes } from '@/features/activites/abilities/effacer-notes/implementations/prisma/effacer-notes.mutation'
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
import { anonymiserLesComptesInactifs } from '@/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs/domain/anonymiser-les-comptes-inactifs'
import { avertirDeLaSuppression } from '@/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs/implementations/email/avertir-de-la-suppression.mutation'
import { lireLesComptesAExaminer } from '@/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs/implementations/prisma/comptes-a-examiner.query'
import { noterLAvertissement } from '@/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs/implementations/prisma/noter-l-avertissement.mutation'
import { RetentionPolicy } from '@/features/utilisateurs/abilities/supprimer-compte/domain/index'
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
import { type UtilisateurId } from '@/features/utilisateurs/domain'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import type { JobExecutor } from '@/jobs/jobs'
import { output } from '@/jobs/output'

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

const supprimerLeCompte =
  (maintenant: Date) =>
  async (utilisateurId: UtilisateurId): Promise<void> => {
    const resultat = await supprimerCompteAvec(
      supprimerComptePorts,
      synchroniserPersonne,
    )({
      cible: utilisateurId,
      auteur: {
        _tag: 'systeme',
        policy: RetentionPolicy('InactifDepuisDeuxAns'),
      },
      maintenant,
    })

    if (!resultat.success) throw new Error(resultat.error._tag)
  }

export const executeAnonymiserLesComptesInactifs: JobExecutor<
  'anonymiser-les-comptes-inactifs'
> = async (job) => {
  const simuler = job.payload?.simuler ?? false
  const maintenant = new Date()

  const comptes = await anonymiserLesComptesInactifs({
    avertirDeLaSuppression,
    supprimerLeCompte: supprimerLeCompte(maintenant),
    lireLesComptesAExaminer,
    noterLAvertissement,
  })({ maintenant, simuler })

  const parEtape = (etape: string) =>
    comptes
      .filter((compte) => compte.etape === etape)
      .map((compte) => compte.utilisateurId)

  const echecs = comptes.filter((compte) => compte.issue === 'echec')

  output.log(
    `anonymiser-les-comptes-inactifs: ${comptes.length} comptes examinés, ${echecs.length} échecs${simuler ? ' (simulation)' : ''}`,
  )

  return {
    simuler,
    examines: comptes.length,
    avertis: parEtape('aAvertir'),
    supprimes: parEtape('aSupprimer'),
    enAttente: parEtape('enAttente').length,
    echecs: echecs.map(({ utilisateurId, etape, cause }) => ({
      utilisateurId,
      etape,
      cause,
    })),
  }
}
