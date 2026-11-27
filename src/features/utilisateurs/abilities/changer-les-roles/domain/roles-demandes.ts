import type { RolesDemandes } from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { AucunRoleDemande } from './errors'

export const rolesDemandes = ({
  mediateur,
  coordinateur,
}: {
  readonly mediateur: boolean
  readonly coordinateur: boolean
}): Result<RolesDemandes, AucunRoleDemande> => {
  if (mediateur && coordinateur)
    return success({ mediateur: true, coordinateur: true })
  if (mediateur) return success({ mediateur: true, coordinateur: false })
  if (coordinateur) return success({ mediateur: false, coordinateur: true })
  return failure(AucunRoleDemande())
}
