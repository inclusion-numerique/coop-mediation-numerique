import type {
  ChangementDeMessage,
  Cloture,
  Ouverture,
  PeriodeEnCours,
} from './reglage'

export type LireLaPeriodeEnCours = () => Promise<PeriodeEnCours | null>

export type OuvrirUnePeriode = (ouverture: Ouverture) => Promise<void>

export type ChangerLeMessage = (
  changement: ChangementDeMessage,
) => Promise<void>

export type CloreLaPeriode = (cloture: Cloture) => Promise<void>

export type ReglerLaMaintenancePorts = {
  readonly lireLaPeriodeEnCours: LireLaPeriodeEnCours
  readonly ouvrirUnePeriode: OuvrirUnePeriode
  readonly changerLeMessage: ChangerLeMessage
  readonly cloreLaPeriode: CloreLaPeriode
}
