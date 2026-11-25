import { signaler } from '@/configuration/telemetry/serveur'
import { echecDefinitif } from '@/features/rdvsp/domain/compte/echec-de-synchronisation'
import { consignerLEchec } from '../domain/consigner-l-echec'
import {
  declencherSynchronisation,
  type SynchroniserUnCompte,
} from '../domain/declencher-synchronisation'
import { lancerSynchronisation } from './lancer-synchronisation.binding'
import { compteACible } from './prisma/compte-a-cible.query'
import { marquerEchecDeSynchronisation } from './prisma/marquer-echec.mutation'

export const declencherSynchronisationAvec = (
  synchroniserUnCompte: SynchroniserUnCompte,
) =>
  consignerLEchec(
    declencherSynchronisation({
      compteACible,
      lancer: lancerSynchronisation(synchroniserUnCompte),
      signaler,
      echecDefinitif,
    }),
    marquerEchecDeSynchronisation(),
  )
