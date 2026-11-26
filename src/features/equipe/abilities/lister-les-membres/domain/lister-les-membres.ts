import type { Page, PageSize } from '@arckit/resultset'
import { failure, type Result, success } from '@/libraries/result'
import {
  ConsultationNonAutorisee,
  type CoordinateurId,
  CoordinateurIntrouvable,
  type CriteresEquipe,
  type Lecteur,
  peutConsulterLEquipe,
} from '../../../domain'
import type {
  CoordinateurDeLaListe,
  MembresDeLEquipe,
} from './membres-de-l-equipe'

export type CoordinateurDeLEquipe = (
  coordinateurId: CoordinateurId,
) => Promise<CoordinateurDeLaListe | null>

export type LireLesMembres = (lecture: {
  readonly coordinateurId: CoordinateurId
  readonly criteres: CriteresEquipe
  readonly page: Page
  readonly pageSize: PageSize
  readonly maintenant: Date
}) => Promise<Omit<MembresDeLEquipe, 'coordinateur'>>

export const listerLesMembres =
  ({
    coordinateurDeLEquipe,
    lireLesMembres,
  }: {
    readonly coordinateurDeLEquipe: CoordinateurDeLEquipe
    readonly lireLesMembres: LireLesMembres
  }) =>
  async ({
    coordinateurId,
    lecteur,
    criteres,
    page,
    pageSize,
    maintenant,
  }: {
    readonly coordinateurId: CoordinateurId
    readonly lecteur: Lecteur
    readonly criteres: CriteresEquipe
    readonly page: Page
    readonly pageSize: PageSize
    readonly maintenant: Date
  }): Promise<
    Result<MembresDeLEquipe, ConsultationNonAutorisee | CoordinateurIntrouvable>
  > => {
    if (!peutConsulterLEquipe(lecteur)(coordinateurId))
      return failure(ConsultationNonAutorisee())

    const coordinateur = await coordinateurDeLEquipe(coordinateurId)
    if (coordinateur === null) return failure(CoordinateurIntrouvable())

    const membres = await lireLesMembres({
      coordinateurId,
      criteres,
      page,
      pageSize,
      maintenant,
    })

    return success({ coordinateur, ...membres })
  }
