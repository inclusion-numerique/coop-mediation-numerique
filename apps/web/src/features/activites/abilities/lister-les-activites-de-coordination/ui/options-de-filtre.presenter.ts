import type { PorteeDuTag } from '@app/web/features/activites/ui/tags/BadgeDePortee'
import type { OptionsDeFiltre } from '../domain'

export type OptionDeTag = {
  readonly value: string
  readonly label: string
  readonly portee: PorteeDuTag
}

export type OptionsDeFiltrePresentees = {
  readonly tags: readonly OptionDeTag[]
  readonly debut: Date
  readonly fin: Date
}

export const optionsDeFiltrePresentees = (
  { tags, periodeCouverte }: OptionsDeFiltre,
  maintenant: Date,
): OptionsDeFiltrePresentees => ({
  tags: tags.map(({ id, nom, portee }) => ({
    value: id,
    label: nom,
    portee,
  })),
  debut: periodeCouverte?.du ?? maintenant,
  fin: periodeCouverte?.au ?? maintenant,
})
