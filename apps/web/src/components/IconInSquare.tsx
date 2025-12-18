import type { ButtonProps } from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import styles from './IconInSquare.module.css'

const sizeToClass = {
  small: styles.small,
  '48': styles['size-48'],
  medium: styles.medium,
  large: styles.large,
}

type IconInSquareSize = keyof typeof sizeToClass

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
  size?: IconInSquareSize
  classes?: {
    icon?: string
  }
}) => (
  <div
    className={classNames(
      background,
      'fr-border-radius--8 fr-text-title--blue-france',
      styles.container,
      sizeToClass[size],
      className,
    )}
    aria-hidden
  >
    <span className={classNames(styles.icon, iconId, classes?.icon)} />
  </div>
)

export default IconInSquare
