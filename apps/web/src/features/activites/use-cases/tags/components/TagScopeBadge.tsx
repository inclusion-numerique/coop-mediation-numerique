import Badge from '@codegouvfr/react-dsfr/Badge'
import classNames from 'classnames'
import { TagScope } from '../tagScope'

const TAG_SEVERITY: Record<TagScope, string> = {
  [TagScope.Personnel]: 'fr-text-mention--grey',
  [TagScope.Departemental]: 'fr-badge--info',
  [TagScope.National]: 'fr-badge--green-menthe',
}

const TagScopeBadge = ({
  scope,
  small,
  className,
}: {
  scope: TagScope
  small?: boolean
  className?: string
}) => (
  <Badge
    small={small}
    className={classNames('fr-text--nowrap', TAG_SEVERITY[scope], className)}
    noIcon
  >
    Tag {scope}
  </Badge>
)

export default TagScopeBadge
