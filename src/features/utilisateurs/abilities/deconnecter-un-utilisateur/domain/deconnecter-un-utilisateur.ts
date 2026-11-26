import {
  UtilisateurId,
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
    readonly utilisateurId: string
  }): Promise<
    Result<UtilisateurDeconnecte, EchecDeDeconnecterUnUtilisateur>
  > => {
    const id = UtilisateurId.safe(utilisateurId)

    if (id === null || !(await compteExiste(id)))
      return failure(UtilisateurIntrouvable(utilisateurId))

    return success({
      utilisateurId: id,
      sessionsFermees: await fermerLesSessions(id),
    })
  }
