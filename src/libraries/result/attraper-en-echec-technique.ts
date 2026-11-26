import { type EchecTechnique, enEchecTechnique } from './echec-technique'
import { failure, type Result, success } from './result'

export const attraperEnEchecTechnique =
  <Entree, Sortie>(effectuer: (entree: Entree) => Promise<Sortie>) =>
  async (entree: Entree): Promise<Result<Sortie, EchecTechnique>> => {
    try {
      return success(await effectuer(entree))
    } catch (erreur) {
      return failure(enEchecTechnique(erreur))
    }
  }
