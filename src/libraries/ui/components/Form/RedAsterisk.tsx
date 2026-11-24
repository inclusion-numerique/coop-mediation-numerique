import classNames from 'classnames'

const RedAsterisk = ({ className }: { className?: string }) => (
  <span
    className={classNames('fr-text-default--error fr-text--regular', className)}
  >
    *
  </span>
)

export default RedAsterisk
