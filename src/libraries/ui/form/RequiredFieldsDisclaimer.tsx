import classNames from 'classnames'
import RedAsterisk from '@/libraries/ui/form/RedAsterisk'

const RequiredFieldsDisclaimer = ({ className }: { className?: string }) => (
  <span className={classNames('fr-text--sm fr-hint-text', className)}>
    Les champs avec <RedAsterisk /> sont obligatoires.
  </span>
)

export default RequiredFieldsDisclaimer
