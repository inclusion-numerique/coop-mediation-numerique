import {
  type ClientApi,
  libellesDesPortees,
} from '@/features/clients-api/domain'
import { dateAsDayAndTime } from '@/libraries/date'
import { hrefDuClientApi } from '../../../../ui/presenters/liens.presenter'

export type LigneDeClientApi = {
  readonly id: string
  readonly href: ReturnType<typeof hrefDuClientApi>
  readonly nom: string
  readonly permissions: string
  readonly debut: string
  readonly fin: string
  readonly creeLe: string
  readonly modifieLe: string
}

export const ligneDeClientApi = ({
  id,
  nom,
  portees,
  validite,
  creeLe,
  modifieLe,
}: ClientApi): LigneDeClientApi => ({
  id,
  href: hrefDuClientApi(id),
  nom,
  permissions: portees.map((portee) => libellesDesPortees[portee]).join(', '),
  debut: dateAsDayAndTime(validite.debut),
  fin: validite.fin == null ? 'Jamais' : dateAsDayAndTime(validite.fin),
  creeLe: dateAsDayAndTime(creeLe),
  modifieLe: dateAsDayAndTime(modifieLe),
})
