import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import classNames from 'classnames'

const RequiredFieldsDisclaimer = ({ className }: { className?: string }) => (
  <span className={classNames('fr-text--sm fr-hint-text', className)}>
    Les champs avec <RedAsterisk /> sont obligatoires.
  </span>
)

export default RequiredFieldsDisclaimer
