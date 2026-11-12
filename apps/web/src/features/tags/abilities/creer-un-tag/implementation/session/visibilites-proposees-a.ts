import type { SessionUser } from '@app/web/auth/sessionUser'
import { acteurDe } from '../../../../implementation/session'
import {
  type OptionDeVisibilite,
  visibilitesProposees,
} from '../../ui/visibilites.presenter'

export const visibilitesProposeesA = (
  user: SessionUser,
): readonly OptionDeVisibilite[] => visibilitesProposees(acteurDe(user))
