import { failure, type Result, success } from '@app/web/libraries/result'
import { AucunRoleDemande } from './errors'

export type RolesDemandes =
  | { readonly mediateur: true; readonly coordinateur: false }
  | { readonly mediateur: false; readonly coordinateur: true }
  | { readonly mediateur: true; readonly coordinateur: true }

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
