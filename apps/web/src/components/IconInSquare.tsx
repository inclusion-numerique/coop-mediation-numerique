import type { ButtonProps } from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import styles from './IconInSquare.module.css'

const IconInSquare = ({
  className,
  iconId,
  size = 'medium',
  background = 'fr-background-alt--blue-france',
  classes,
}: {
  background?: string
  className?: string
  iconId: ButtonProps.IconOnly['iconId']
  size?: 'small' | 'medium' | 'large'
  classes?: {
    icon?: string
  }
}) => (
  <div
    className={classNames(
      background,
      'fr-border-radius--8 fr-text-title--blue-france',
      styles.container,
      styles[size],
      className,
    )}
  >
    <span
      className={classNames(styles.icon, iconId, classes?.icon)}
      aria-hidden
    />
  </div>
)

export default IconInSquare
