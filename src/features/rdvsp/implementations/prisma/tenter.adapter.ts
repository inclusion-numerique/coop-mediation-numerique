import { failure, type Result, success } from '@/libraries/result'
import { ErreurTechnique } from '../../domain/errors'

export const tenter =
  <Entree extends readonly unknown[], Sortie>(
    operation: (...entree: Entree) => Promise<Sortie>,
  ) =>
  async (...entree: Entree): Promise<Result<Sortie, ErreurTechnique>> =>
    operation(...entree).then(
      (sortie) => success(sortie),
      (erreur: unknown) => failure(ErreurTechnique(erreur)),
    )
