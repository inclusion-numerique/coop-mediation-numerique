import type { UtilisateurId } from '@/features/inscription/domain'
import type { MediateurId } from './mediateur-id'
import type { InscritARecapituler } from './recapitulatif'

export type LireLInscritARecapituler = (
  utilisateurId: UtilisateurId,
) => Promise<InscritARecapituler>

type ListerLesLieux<Lieu> = (critere: {
  readonly mediateurId: MediateurId
}) => Promise<readonly Lieu[]>

export type CompterLesMediateursCoordonnes = (
  utilisateurId: UtilisateurId,
) => Promise<number>

export type ConsulterLeRecapitulatifPorts<Lieu> = {
  readonly lireLInscritARecapituler: LireLInscritARecapituler
  readonly listerLesLieux: ListerLesLieux<Lieu>
  readonly compterLesMediateursCoordonnes: CompterLesMediateursCoordonnes
}
