import {
  Select as DsfrSelect,
  SelectProps as DsfrSelectProps,
} from '@codegouvfr/react-dsfr/SelectNext'

import Option = DsfrSelectProps.Option

import { useFieldContext } from '@app/web/libs/form/form-context'
import classNames from 'classnames'
import { ChangeEvent } from 'react'
import { Label } from './Label'

type MultiSelectProps<T extends Option<string>[]> = Omit<
  DsfrSelectProps<T>,
  'name'
> & {
  isPending: boolean
}

const MultiSelect = <T extends Option<string>[]>({
  isPending,
  label,
  options,
  nativeSelectProps,
  ...props
}: MultiSelectProps<T>) => {
  const { name, state, handleBlur, handleChange } = useFieldContext<string[]>()
  const errors: Error[] = state.meta.errors
  const hasErrors = errors.length > 0 && state.meta.isTouched

  return (
    <DsfrSelect
      state={hasErrors ? 'error' : undefined}
      stateRelatedMessage={hasErrors ? errors[0].message : undefined}
      label={<Label hasErrors={hasErrors}>{label}</Label>}
      options={
        options.map((option) => ({
          ...option,
          disabled: state.value?.includes(option.value) ?? option.disabled,
        })) as T
      }
      disabled={isPending}
      nativeSelectProps={{
        ...nativeSelectProps,
        name,
        value: '',
        onBlur: handleBlur,
        onChange: (e: ChangeEvent<HTMLSelectElement>) =>
          handleChange([...(state.value ?? []), e.target.value]),
        className: classNames(
          'fr-select--white',
          props.className,
          nativeSelectProps?.className,
        ),
      }}
      {...props}
    />
  )
}
export default MultiSelect
