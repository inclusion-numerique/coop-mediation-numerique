import {
  Select as DsfrSelect,
  SelectProps as DsfrSelectProps,
} from '@codegouvfr/react-dsfr/SelectNext'
import Option = DsfrSelectProps.Option
import { Label } from './Label'
import { useFieldContext } from '@app/web/libs/form/form-context'
import { ChangeEvent } from 'react'

type SelectProps<T extends Option<string>[]> = Omit<
  DsfrSelectProps<T>,
  'name'
> & {
  isPending: boolean
}

export const Select = <T extends Option<string>[]>({
  isPending,
  label,
  ...props
}: SelectProps<T>) => {
  const { name, state, handleBlur, handleChange } = useFieldContext<string>()

  return (
    <DsfrSelect
      label={<Label>{label}</Label>}
      disabled={isPending}
      nativeSelectProps={{
        name,
        value: state.value,
        onBlur: handleBlur,
        onChange: (e: ChangeEvent<HTMLSelectElement>) =>
          handleChange(e.target.value),
        className: 'fr-select--white fr-select--14v',
      }}
      {...props}
    />
  )
}
