import type { ButtonProps } from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'

const sizeToClass = {
  small: 'icone-dans-un-carre--petite',
  '48': 'icone-dans-un-carre--48',
  medium: 'icone-dans-un-carre--moyenne',
  large: 'icone-dans-un-carre--grande',
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
  classes?:
    | {
        icon?: string | undefined
      }
    | undefined
}) => (
  <div
    className={classNames(
      background,
      'fr-border-radius--8 fr-text-title--blue-france',
      'icone-dans-un-carre',
      sizeToClass[size],
      className,
    )}
    aria-hidden
  >
    <span
      className={classNames(
        'icone-dans-un-carre__icone',
        iconId,
        classes?.icon,
      )}
    />
  </div>
)

export default IconInSquare
