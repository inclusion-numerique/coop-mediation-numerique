import { supprimerComptePorts } from '@app/web/composition/utilisateurs/supprimer-compte.ports'
import {
  anonymiserLesComptesInactifs,
  avertirDeLaSuppression,
} from '@app/web/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs'
import {
  RetentionPolicy,
  supprimerCompte,
} from '@app/web/features/utilisateurs/abilities/supprimer-compte'
import { type UtilisateurId } from '@app/web/features/utilisateurs/domain'
import type { JobExecutor } from '@app/web/jobs/jobExecutors'
import { output } from '@app/web/jobs/output'

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
