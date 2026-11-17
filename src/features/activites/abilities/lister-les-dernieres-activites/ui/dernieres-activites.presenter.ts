import { dateAsDay } from '@app/web/utils/dateAsDay'
import type { ActiviteConsultee } from '../../../domain'
import {
  type CarteDActivite,
  carteDActivite,
} from '../../../ui/carte/carte-d-activite.presenter'

export type DerniereActivite = {
  readonly carte: CarteDActivite
  readonly jour: string
}

export const dernieresActivitesPresentees = (
  activites: readonly ActiviteConsultee[],
  fuseau: string,
): readonly DerniereActivite[] =>
  activites.map((consultee) => ({
    carte: carteDActivite(consultee, fuseau),
    jour: dateAsDay(new Date(consultee.activite.date)),
  }))
