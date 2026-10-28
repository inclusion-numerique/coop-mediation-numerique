import { TagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import type { OptionsDeFiltre, PorteeDeTag } from '../domain'

export type OptionDeTag = {
  readonly value: string
  readonly label: string
  readonly scope: TagScope
}

export type OptionsDeFiltrePresentees = {
  readonly tags: readonly OptionDeTag[]
  readonly debut: Date
  readonly fin: Date
}

const PORTEES: Record<string, TagScope> = {
  Personnel: TagScope.Personnel,
  Equipe: TagScope.Equipe,
  Departemental: TagScope.Departemental,
  National: TagScope.National,
}

const portee = (valeur: PorteeDeTag): TagScope =>
  PORTEES[valeur] ?? TagScope.National

export const optionsDeFiltrePresentees = (
  { tags, periodeCouverte }: OptionsDeFiltre,
  maintenant: Date,
): OptionsDeFiltrePresentees => ({
  tags: tags.map(({ id, nom, portee: valeur }) => ({
    value: id,
    label: nom,
    scope: portee(valeur),
  })),
  debut: periodeCouverte?.du ?? maintenant,
  fin: periodeCouverte?.au ?? maintenant,
})
