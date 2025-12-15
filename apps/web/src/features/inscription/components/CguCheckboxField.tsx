import CheckboxFormField from '@app/ui/components/Form/CheckboxFormField'
import { Control, FieldValues, Path } from 'react-hook-form'

const CguCheckboxField = <T extends FieldValues>({
  control,
  disabled,
  path,
}: {
  control: Control<T>
  disabled?: boolean
  path: Path<T>
}) => (
  <CheckboxFormField
    path={path}
    label={
      <>
        J’ai lu et j'accepte les{' '}
        <a href="/cgu" className="fr-link" target="_blank">
          conditions générales d'utilisation du service
        </a>
      </>
    }
    classes={{
      label: 'fr-display-block',
    }}
    control={control}
    disabled={disabled}
  />
)

export default CguCheckboxField
