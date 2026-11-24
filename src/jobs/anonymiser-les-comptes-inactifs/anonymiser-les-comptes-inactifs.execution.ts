import { effacerNotes } from '@/features/activites/abilities/effacer-notes/implementations/prisma/effacer-notes.mutation'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille/implementations/prisma/anonymiser-portefeuille.mutation'
import { detacherDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes/implementations/prisma/detacher-des-equipes.mutation'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux/implementations/prisma/retirer-des-lieux.mutation'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques/implementations/prisma/revoquer-partage-statistiques.mutation'
import { effacerEmpreinteRdv } from '@/features/rdvsp/abilities/effacer-empreinte-rdv/implementations/effacer-empreinte-rdv.binding'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte/implementations/prisma/retirer-les-tags-d-un-compte.mutation'
import { anonymiserLesComptesInactifsAvec } from '@/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs/implementations/anonymiser-les-comptes-inactifs.binding'
import { RetentionPolicy } from '@/features/utilisateurs/abilities/supprimer-compte/domain/index'
import type { EffacementsDesAutresFeatures } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/supprimer-compte.binding'
import { supprimerCompteAvec } from '@/features/utilisateurs/abilities/supprimer-compte/implementations/supprimer-compte.binding'
import { type UtilisateurId } from '@/features/utilisateurs/domain'
import type { JobExecutor } from '@/jobs/job-executors'
import { output } from '@/jobs/output'

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

  const comptes = await anonymiserLesComptesInactifsAvec(
    supprimerLeCompte(maintenant),
  )({ maintenant, simuler })

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
