import {
  type UtilisateurId,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeDeconnecterUnUtilisateur } from './errors'
import type { DeconnecterUnUtilisateurPorts } from './ports'

export type UtilisateurDeconnecte = {
  readonly utilisateurId: UtilisateurId
  readonly sessionsFermees: number
}

export const deconnecterUnUtilisateur =
  ({ compteExiste, fermerLesSessions }: DeconnecterUnUtilisateurPorts) =>
  async ({
    utilisateurId,
  }: {
    readonly utilisateurId: UtilisateurId | null
  }): Promise<
    Result<UtilisateurDeconnecte, EchecDeDeconnecterUnUtilisateur>
  > => {
    if (utilisateurId === null || !(await compteExiste(utilisateurId)))
      return failure(UtilisateurIntrouvable())

    return success({
      utilisateurId,
      sessionsFermees: await fermerLesSessions(utilisateurId),
    })
  }
