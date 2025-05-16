import Notice from '@codegouvfr/react-dsfr/Notice'
import classNames from 'classnames'

export const EmptyState = ({
  title,
  className,
}: {
  title: string
  className?: string
}) => (
  <Notice
    className={classNames(
      'fr-notice--flex fr-align-items-center fr-mt-2v',
      className,
    )}
    title={
      <span className="fr-text-default--grey fr-text--regular fr-text--sm">
        {title}
      </span>
    }
  />
)
