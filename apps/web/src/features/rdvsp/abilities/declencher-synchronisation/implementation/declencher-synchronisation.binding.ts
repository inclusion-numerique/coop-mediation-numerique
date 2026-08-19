import { echecDefinitif } from '@app/web/features/rdvsp/implementation/synchroniser-compte.binding'
import * as Sentry from '@sentry/nextjs'
import { declencherSynchronisation } from './declencher-synchronisation'
import { lancerSynchronisation } from './lancer-synchronisation.adapter'
import { compteACible } from './prisma/compte-a-cible.query'
import { marquerEchecDeSynchronisation } from './prisma/marquer-echec.mutation'

/**
 * Composition de l'ability avec ses adaptateurs réels.
 *
 * Elle vit ici plutôt que dans chaque fichier d'action : quatre appelants — trois
 * server actions et le retour du parcours OAuth — déclenchent la même passe, et
 * la recopier ferait diverger le jour où l'on change une dépendance.
 *
 * À importer par ce chemin explicite : le module tire Prisma et Sentry, qu'un
 * composant client ne doit jamais embarquer.
 */
export const declencherSynchronisationBinding = declencherSynchronisation({
  compteACible,
  lancer: lancerSynchronisation,
  marquerEchec: marquerEchecDeSynchronisation(),
  signaler: (erreur) => Sentry.captureException?.(erreur),
  echecDefinitif,
})
