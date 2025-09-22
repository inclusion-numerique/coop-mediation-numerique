import Badge from '@codegouvfr/react-dsfr/Badge'
import classNames from 'classnames'
import { TagScope } from '../tagScope'

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
    className={classNames(
      'fr-text--nowrap',
      scope === 'personnel' ? 'fr-text-mention--grey' : undefined,
      className,
    )}
    severity={scope === TagScope.Personnel ? undefined : 'info'}
    noIcon
  >
    Tag {scope}
  </Badge>
)

export default TagScopeBadge
