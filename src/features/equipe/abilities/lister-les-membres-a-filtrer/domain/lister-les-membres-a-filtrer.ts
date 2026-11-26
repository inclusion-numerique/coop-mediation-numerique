import { type Result, success } from '@/libraries/result'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import {
  type EquipeAFiltrer,
  type MembreAFiltrer,
  membresDansLOrdre,
} from './membre-a-filtrer'
import type { ListerLesMembresAFiltrerPorts } from './ports'
import { membresRecherches } from './recherche-de-membres'

export const listerLesMembresAFiltrer =
  ({
    lireLeDemandeur,
    lireLesMembresAFiltrer,
  }: ListerLesMembresAFiltrerPorts) =>
  async ({
    equipe,
    demandeur,
    recherche,
  }: {
    readonly equipe: EquipeAFiltrer | null
    readonly demandeur: MediateurId | null
    readonly recherche: string | null
  }): Promise<Result<readonly MembreAFiltrer[], never>> => {
    if (equipe === null) return success([])

    const [identiteDuDemandeur, membres] = await Promise.all([
      demandeur === null ? null : lireLeDemandeur(demandeur),
      lireLesMembresAFiltrer(equipe),
    ])

    const dansLOrdre = membresDansLOrdre(identiteDuDemandeur, membres)

    return success(
      recherche === null
        ? dansLOrdre
        : membresRecherches(dansLOrdre, recherche),
    )
  }
