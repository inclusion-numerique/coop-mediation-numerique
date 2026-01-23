import { ReactNode } from 'react'
import { TagItem } from '../components/TagItem'
import { MergeDestinationTag } from '../merge/MergeTagComboBox'
import { TagScope } from '../tagScope'

export const TagList = ({
  tags,
  actions,
}: {
  tags: {
    id: string
    nom: string
    scope: TagScope
    description?: string
    usageCount?: number
    accompagnementsCount: number
    equipeId?: string
    equipeNumber?: number
    equipeCoordinateurNom?: string
    defaultMergeDestinations?: MergeDestinationTag[]
  }[]
  actions?: (tag: {
    id: string
    nom: string
    scope: TagScope
    description?: string
    accompagnementsCount: number
    equipeId?: string
    equipeNumber?: number
    equipeCoordinateurNom?: string
    defaultMergeDestinations?: MergeDestinationTag[]
  }) => ReactNode
}) => (
  <ul className="fr-raw-list">
    {tags.map((tag) => (
      <li key={tag.id} className="fr-border--bottom fr-py-5v">
        <TagItem {...tag} actions={actions?.(tag)} />
      </li>
    ))}
  </ul>
)
