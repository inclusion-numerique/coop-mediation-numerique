import type { MediateurId } from '@/features/mediateurs/domain'
import type {
  MediateurARegler,
  ReglageDeVisibilite,
} from './reglage-de-visibilite'

export type LireLeMediateurARegler = (
  mediateurId: MediateurId,
) => Promise<MediateurARegler | null>

export type EnregistrerLaVisibilite = (
  reglage: ReglageDeVisibilite,
) => Promise<void>

export type ReglerLaVisibiliteCartoPorts = {
  readonly lireLeMediateur: LireLeMediateurARegler
  readonly enregistrer: EnregistrerLaVisibilite
}
