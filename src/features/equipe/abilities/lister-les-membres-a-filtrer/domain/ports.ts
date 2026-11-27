import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type {
  EquipeAFiltrer,
  IdentiteDuMembre,
  MembreLu,
} from './membre-a-filtrer'

export type LireLeDemandeur = (
  mediateurId: MediateurId,
) => Promise<IdentiteDuMembre | null>

export type LireLesMembresAFiltrer = (
  equipe: EquipeAFiltrer,
) => Promise<readonly MembreLu[]>

export type ListerLesMembresAFiltrerPorts = {
  readonly lireLeDemandeur: LireLeDemandeur
  readonly lireLesMembresAFiltrer: LireLesMembresAFiltrer
}
