import { failure, type Result, success } from '@/libraries/result'
import {
  ConsultationNonAutorisee,
  type CoordinateurId,
  type CriteresEquipe,
  type Lecteur,
  type LigneEquipe,
  peutConsulterLEquipe,
} from '../../../domain'
import type { MembreAExporter } from './contrat-membre'

export type LireLesMembresAExporter = (lecture: {
  readonly coordinateurId: CoordinateurId
  readonly criteres: CriteresEquipe
  readonly maintenant: Date
}) => Promise<readonly MembreAExporter<LigneEquipe>[]>

export const exporterLesMembres =
  ({
    lireLesMembresAExporter,
  }: {
    readonly lireLesMembresAExporter: LireLesMembresAExporter
  }) =>
  async ({
    coordinateurId,
    lecteur,
    criteres,
    maintenant,
  }: {
    readonly coordinateurId: CoordinateurId
    readonly lecteur: Lecteur
    readonly criteres: CriteresEquipe
    readonly maintenant: Date
  }): Promise<
    Result<readonly MembreAExporter<LigneEquipe>[], ConsultationNonAutorisee>
  > =>
    peutConsulterLEquipe(lecteur)(coordinateurId)
      ? success(
          await lireLesMembresAExporter({
            coordinateurId,
            criteres,
            maintenant,
          }),
        )
      : failure(ConsultationNonAutorisee())
