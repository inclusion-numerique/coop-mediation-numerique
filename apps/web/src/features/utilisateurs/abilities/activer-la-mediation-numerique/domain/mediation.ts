import { failure, type Result, success } from '@app/web/libraries/result'

export type CompteQuiActive = {
  readonly estCoordinateur: boolean
  readonly estMediateur: boolean
}

export type NonCoordinateur = { readonly _tag: 'NonCoordinateur' }

export type Activation = 'AActiver' | 'DejaActivee'

export const activationDe = ({
  estCoordinateur,
  estMediateur,
}: CompteQuiActive): Result<Activation, NonCoordinateur> => {
  if (!estCoordinateur) return failure({ _tag: 'NonCoordinateur' })
  return success(estMediateur ? 'DejaActivee' : 'AActiver')
}
