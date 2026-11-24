import classNames from 'classnames'

export const Spinner = ({
  className,
  size = 'medium',
  inline,
}: {
  className?: string
  size?: 'small' | 'medium' | 'large'
  inline?: boolean
}) => (
  <span
    className={classNames(
      'indicateur-de-chargement',
      inline && 'indicateur-de-chargement--en-ligne',
      {
        'indicateur-de-chargement--petit': size === 'small',
        'indicateur-de-chargement--moyen': size === 'medium',
        'indicateur-de-chargement--grand': size === 'large',
      },
      className,
    )}
  />
)
