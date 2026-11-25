import type {
  LancerSynchronisation,
  SynchroniserUnCompte,
} from '../../domain/declencher-synchronisation'
import { compteDeLUtilisateur } from './compte-de-l-utilisateur.query'

export const lancerSynchronisation =
  (synchroniserUnCompte: SynchroniserUnCompte): LancerSynchronisation =>
  async ({ utilisateurId, organisationIds }) => {
    const compte = await compteDeLUtilisateur(utilisateurId)

    if (compte === null) {
      return { derive: 0 }
    }

    const { drift } = await synchroniserUnCompte({
      ...compte,
      ...(organisationIds === undefined
        ? {}
        : { organisationIds: [...organisationIds] }),
    })

    return { derive: drift }
  }
