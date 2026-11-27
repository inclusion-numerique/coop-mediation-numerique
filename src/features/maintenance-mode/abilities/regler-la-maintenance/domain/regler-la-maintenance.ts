import type { AuteurId } from '@/features/maintenance-mode/domain'
import { type Result, success } from '@/libraries/result'
import type { EcrituresDuReglage, ReglerLaMaintenancePorts } from './ports'
import {
  type DemandeDeReglage,
  type Reglage,
  reglageDeLaMaintenance,
} from './reglage'

const appliquer =
  ({
    ouvrirUnePeriode,
    changerLeMessage,
    cloreLaPeriode,
  }: EcrituresDuReglage) =>
  async (reglage: Reglage): Promise<void> => {
    if (reglage._tag === 'Ouvrir') return ouvrirUnePeriode(reglage)
    if (reglage._tag === 'ChangerLeMessage') return changerLeMessage(reglage)
    if (reglage._tag === 'Clore') return cloreLaPeriode(reglage)
  }

export const reglerLaMaintenance =
  ({
    lireLaPeriodeEnCours,
    ouvrirUnePeriode,
    changerLeMessage,
    cloreLaPeriode,
  }: ReglerLaMaintenancePorts) =>
  async ({
    demande,
    auteurId,
    maintenant,
  }: {
    readonly demande: DemandeDeReglage
    readonly auteurId: AuteurId
    readonly maintenant: Date
  }): Promise<Result<Reglage, never>> => {
    const reglage = reglageDeLaMaintenance({
      periodeEnCours: await lireLaPeriodeEnCours(),
      demande,
      auteurId,
      maintenant,
    })

    await appliquer({ ouvrirUnePeriode, changerLeMessage, cloreLaPeriode })(
      reglage,
    )

    return success(reglage)
  }
