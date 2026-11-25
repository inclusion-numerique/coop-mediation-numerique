import { signaler } from '@/configuration/telemetry/serveur'
import { echecDefinitif } from '@/features/rdvsp/domain/compte/echec-de-synchronisation'
import { consignerLEchec } from '../domain/consigner-l-echec'
import {
  declencherSynchronisation,
  type SynchroniserUnCompte,
} from '../domain/declencher-synchronisation'
import { compteACible } from './prisma/compte-a-cible.query'
import { lancerSynchronisation } from './prisma/lancer-synchronisation.adapter'
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
