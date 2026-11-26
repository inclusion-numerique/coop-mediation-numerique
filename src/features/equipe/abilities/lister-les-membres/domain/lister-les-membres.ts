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
import type { EchecDeListe } from './errors'
import type { MembresDeLEquipe } from './membres-de-l-equipe'
import type { ListerLesMembresPorts } from './ports'

export const listerLesMembres =
  ({
    lireLeCoordinateur,
    lireLeDepartementDuCoordinateur,
    lireLesMembres,
  }: ListerLesMembresPorts) =>
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
  }): Promise<Result<MembresDeLEquipe, EchecDeListe>> => {
    if (!peutConsulterLEquipe(lecteur)(coordinateurId))
      return failure(ConsultationNonAutorisee())

    const [coordinateur, departementCode] = await Promise.all([
      lireLeCoordinateur(coordinateurId),
      lireLeDepartementDuCoordinateur(coordinateurId),
    ])
    if (coordinateur === null) return failure(CoordinateurIntrouvable())

    const membres = await lireLesMembres({
      coordinateurId,
      criteres,
      page,
      pageSize,
      maintenant,
    })

    return success({
      coordinateur: { ...coordinateur, departementCode },
      ...membres,
    })
  }
