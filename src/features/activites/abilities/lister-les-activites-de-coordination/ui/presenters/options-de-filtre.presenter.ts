import type { OptionsDeFiltre } from '../../domain'

type OptionDeTag = {
  readonly value: string
  readonly label: string
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
  tags: tags.map(({ id, nom }) => ({ value: id, label: nom })),
  debut: periodeCouverte?.du ?? maintenant,
  fin: periodeCouverte?.au ?? maintenant,
})
