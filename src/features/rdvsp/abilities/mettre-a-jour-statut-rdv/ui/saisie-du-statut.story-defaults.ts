import { ServerActionSuccess } from '@/libraries/nextjs/action/result'
import { provide } from '@/libs/injection/client'
import { StatutPresence } from '../../../domain/statut-presence'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '../action/mettre-a-jour-statut-rdv.key'
import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from './creer-activite-depuis-rdv.key'

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
