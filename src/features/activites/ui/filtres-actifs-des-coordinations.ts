import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { CriteresDesCoordinations, NomDeTag, TagId } from '../domain'
import { libelleDuType } from './libelles-de-coordination'

export type FiltreActif = {
  readonly params: readonly string[]
  readonly value?: string
  readonly label: string
}

export const filtresActifsDesCoordinations = (
  { periode, types, tags }: CriteresDesCoordinations,
  tagsConnus: readonly { readonly id: TagId; readonly nom: NomDeTag }[],
): readonly FiltreActif[] => [
  ...(periode === null
    ? []
    : [
        {
          params: ['du', 'au'],
          label: `${dateAsIsoDay(periode.du)} - ${dateAsIsoDay(periode.au)}`,
        },
      ]),
  ...types.map((type) => ({
    params: ['types'],
    value: type,
    label: libelleDuType(type),
  })),
  ...tags.map((tag) => ({
    params: ['tags'],
    value: tag,
    label: `Tag : ${tagsConnus.find(({ id }) => id === tag)?.nom ?? tag}`,
  })),
]
