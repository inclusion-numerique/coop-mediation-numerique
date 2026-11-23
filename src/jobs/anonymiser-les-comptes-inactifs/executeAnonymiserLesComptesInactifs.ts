import { effacerNotes } from '@/features/activites/abilities/effacer-notes'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille'
import { detacherDesEquipes } from '@/features/equipe/abilities/detacher-des-equipes'
import { retirerDesLieux } from '@/features/lieux-activite/abilities/retirer-des-lieux'
import { revoquerPartageStatistiques } from '@/features/mediateurs/abilities/revoquer-partage-statistiques'
import { effacerEmpreinteRdv } from '@/features/rdvsp/abilities/effacer-empreinte-rdv'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { retirerLesTagsDUnCompte } from '@/features/tags/abilities/retirer-les-tags-d-un-compte'
import {
  anonymiserLesComptesInactifs,
  avertirDeLaSuppression,
} from '@/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs'
import {
  hash,
  RetentionPolicy,
  retirerDesListesDeDiffusion,
  type SupprimerComptePorts,
  supprimerCompte,
} from '@/features/utilisateurs/abilities/supprimer-compte'
import { type UtilisateurId } from '@/features/utilisateurs/domain'
import type { JobExecutor } from '@/jobs/jobExecutors'
import { output } from '@/jobs/output'

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

const supprimerLeCompte =
  (maintenant: Date) =>
  async (utilisateurId: UtilisateurId): Promise<void> => {
    const resultat = await supprimerCompte({
      command: {
        cible: utilisateurId,
        auteur: {
          _tag: 'systeme',
          policy: RetentionPolicy('InactifDepuisDeuxAns'),
        },
        maintenant,
      },
      ports: supprimerComptePorts,
      synchroniserLaPersonne: synchroniserPersonne,
    })

    if (!resultat.success) throw new Error(resultat.error._tag)
  }

export const executeAnonymiserLesComptesInactifs: JobExecutor<
  'anonymiser-les-comptes-inactifs'
> = async (job) => {
  const simuler = job.payload?.simuler ?? false
  const maintenant = new Date()

  const comptes = await anonymiserLesComptesInactifs({
    maintenant,
    simuler,
    ports: {
      avertirDeLaSuppression,
      supprimerLeCompte: supprimerLeCompte(maintenant),
    },
  })

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
