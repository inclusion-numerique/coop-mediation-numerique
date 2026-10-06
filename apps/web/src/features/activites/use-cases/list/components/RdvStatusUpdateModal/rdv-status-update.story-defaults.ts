import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.key'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.key'
import { StatutPresence } from '@app/web/features/rdvsp/domain/statut-presence'
import { ServerActionSuccess } from '@app/web/libraries/nextjs/action/result'
import { provide } from '@app/web/libs/injection/client'

export const provideRdvStatusUpdateDefaults = () => {
  provide(CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY, async () =>
    ServerActionSuccess({ urlCreationCra: '/coop/mes-activites' }),
  )
  provide(METTRE_A_JOUR_STATUT_RDV_ACTION_KEY, async ({ statut }) =>
    ServerActionSuccess({
      statutPresence: StatutPresence(statut),
      compteRenduRegle: true,
    }),
  )
}
