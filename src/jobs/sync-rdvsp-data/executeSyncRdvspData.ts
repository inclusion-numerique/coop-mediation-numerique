import { creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/creer-ou-fusionner-depuis-usager-externe.binding'
import { declencherSynchronisationAvec } from '@/features/rdvsp/abilities/declencher-synchronisation/implementations/declencher-synchronisation.binding'
import { synchroniserTousLesComptesRdvAvec } from '@/features/rdvsp/abilities/synchroniser-tous-les-comptes-rdv/implementations/synchroniser-tous-les-comptes-rdv.binding'
import { output } from '@/libraries/console/output'
import type { SyncRdvspDataJob } from './syncRdvspDataJob'

const synchroniserTousLesComptes = synchroniserTousLesComptesRdvAvec(
  declencherSynchronisationAvec(
    creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding,
  ),
)

export const executeSyncRdvspData = async (_job: SyncRdvspDataJob) => {
  const bilan = await synchroniserTousLesComptes(new Date())

  if (bilan.echecs.length > 0) {
    output(
      bilan.echecs
        .map(
          ({ utilisateurId, raison }) =>
            `Error syncing user ${utilisateurId}: ${raison}`,
        )
        .join('\n'),
    )
  }

  output(
    `Completed RDVSP sync. Synced ${bilan.synchronises}/${bilan.eligibles} eligible users out of ${bilan.comptes} with RDV account`,
  )

  return {
    totalUsers: bilan.comptes,
    eligibleUsers: bilan.eligibles,
    synced: bilan.synchronises,
  }
}
